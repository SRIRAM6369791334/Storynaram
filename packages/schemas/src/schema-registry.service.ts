import { Injectable, Inject, OnModuleInit, OnApplicationShutdown, Logger } from '@nestjs/common';
import type { SchemaMeta, SchemaId, SchemaCategory, RegistryConfig, DiscoveryResult, CompilationResult, RegistryStats, SchemaSearchQuery, SchemaIndexEntry } from './types.js';
import { DuplicateSchemaError } from './errors.js';
import { SchemaDiscoveryService } from './schema-discovery.service.js';
import { SchemaLoaderService } from './schema-loader.service.js';
import { SchemaMetadataService } from './schema-metadata.service.js';
import { SchemaCompilerService } from './schema-compiler.service.js';
import { SchemaCacheService } from './schema-cache.service.js';
import { SchemaResolverService } from './schema-resolver.service.js';
import { SchemaDependencyGraphService } from './schema-dependency-graph.service.js';
import { SchemaIndexService } from './schema-index.service.js';

@Injectable()
export class SchemaRegistryService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(SchemaRegistryService.name);
  private startTime = Date.now();
  private readonly config: RegistryConfig;
  private isLoaded = false;

  constructor(
    private readonly discovery: SchemaDiscoveryService,
    private readonly loader: SchemaLoaderService,
    private readonly metadata: SchemaMetadataService,
    private readonly compiler: SchemaCompilerService,
    private readonly cache: SchemaCacheService,
    private readonly resolver: SchemaResolverService,
    private readonly graph: SchemaDependencyGraphService,
    private readonly index: SchemaIndexService,
    @Inject('REGISTRY_CONFIG') config?: RegistryConfig,
  ) {
    this.config = config ?? {};
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('SchemaRegistry initializing...');
    if (this.config.autoLoad !== false) {
      await this.loadAll();
    }
  }

  onApplicationShutdown(): void {
    this.logger.log('SchemaRegistry shutting down...');
    this.cache.clear();
    this.index.clear();
    this.graph.clear();
    this.isLoaded = false;
  }

  async loadAll(): Promise<DiscoveryResult> {
    const start = Date.now();
    this.logger.log('Starting schema discovery...');

    const result = this.discovery.discover();
    this.logger.log(`Discovered ${String(result.found)} schemas in ${String(result.duration)}ms`);

    if (result.errors.length > 0) {
      for (const err of result.errors) {
        this.logger.warn(`Discovery warning: ${err}`);
      }
    }

    const loaded = this.loader.loadAll(result.paths);
    const successCount = loaded.filter(l => !l.error).length;
    this.logger.log(`Loaded ${String(successCount)}/${String(result.found)} schemas`);

    const metas = this.metadata.extractAll(loaded);
    this.logger.log(`Extracted metadata for ${metas.length} schemas`);

    const metaMap = new Map<SchemaId, SchemaMeta>();
    for (const meta of metas) {
      metaMap.set(meta.$id, meta);
    }

    this.resolver.resolveAllDependencies(metaMap);

    this.graph.build(metas);

    const cycleCheck = this.graph.hasCycles();
    if (cycleCheck.hasCycles) {
      this.logger.warn(`Found ${String(cycleCheck.cycles?.length ?? 0)} dependency cycles`);
    }

    this.index.build(metas);

    if (!this.config.lazyCompile) {
      const compilationOrder = this.graph.topologicalSort();
      this.logger.log(`Compiling ${compilationOrder.length} schemas...`);

      for (const schemaId of compilationOrder) {
        const meta = metaMap.get(schemaId);
        if (!meta) continue;
        const raw = this.cache.getRaw(meta.filePath) ?? {};
        this.compiler.registerSchema(schemaId, raw);
      }

      const compileResults = this.compiler.compileAll(compilationOrder);
      const compiled = compileResults.filter(r => r.success).length;
      const failed = compileResults.filter(r => !r.success);

      for (const f of failed) {
        this.logger.warn(`Compilation failed for ${f.schemaId}: ${String(f.errors?.join(', '))}`);
      }

      this.logger.log(`Compiled ${String(compiled)}/${String(compilationOrder.length)} schemas`);
    }

    this.isLoaded = true;
    this.startTime = Date.now();

    await Promise.resolve();

    return { ...result, duration: Date.now() - start };
  }

  async reloadAll(): Promise<DiscoveryResult> {
    this.cache.clear();
    this.index.clear();
    this.graph.clear();
    this.isLoaded = false;
    return this.loadAll();
  }

  register(schema: { schemaId: SchemaId; schema: object; category: SchemaCategory; filePath?: string }): void {
    if (this.index.has(schema.schemaId)) {
      throw new DuplicateSchemaError(schema.schemaId);
    }
    const filePath = schema.filePath ?? `runtime/${schema.category}/${schema.schemaId}.schema.json`;
    const raw = schema.schema as Record<string, unknown>;

    const meta = this.metadata.extract(filePath, raw);
    this.index.build([meta]);
    this.compiler.registerSchema(schema.schemaId, schema.schema);

    this.graph.addEdge(schema.schemaId, schema.schemaId);
    this.isLoaded = true;
    this.logger.log(`Registered schema: ${schema.schemaId}`);
  }

  registerMany(schemas: { schemaId: SchemaId; schema: object; category: SchemaCategory }[]): void {
    for (const s of schemas) {
      this.register(s);
    }
  }

  get(schemaId: SchemaId): SchemaMeta | undefined {
    return this.index.getById(schemaId);
  }

  getById(schemaId: SchemaId): SchemaMeta | undefined {
    return this.index.getById(schemaId);
  }

  getByCategory(category: SchemaCategory): SchemaMeta[] {
    return this.index.getByCategory(category);
  }

  has(schemaId: SchemaId): boolean {
    return this.index.has(schemaId);
  }

  list(): SchemaIndexEntry[] {
    return this.index.list();
  }

  remove(schemaId: SchemaId): boolean {
    const removed = this.index.remove(schemaId);
    if (removed) {
      this.compiler.removeSchema(schemaId);
      this.logger.log(`Removed schema: ${schemaId}`);
    }
    return removed;
  }

  clear(): void {
    this.cache.clear();
    this.index.clear();
    this.graph.clear();
    this.compiler.clear();
    this.isLoaded = false;
    this.logger.log('Registry cleared');
  }

  compile(schemaId: SchemaId): CompilationResult {
    return this.compiler.compile(schemaId);
  }

  compileAll(): CompilationResult[] {
    const all = this.list().map(e => e.schemaId);
    return this.compiler.compileAll(all);
  }

  validate(schemaId: SchemaId, data: unknown): { valid: boolean; errors?: string[] } {
    return this.compiler.validate(schemaId, data);
  }

  find(query: SchemaSearchQuery): SchemaMeta[] {
    return this.index.find(query);
  }

  search(query: SchemaSearchQuery): SchemaIndexEntry[] {
    const results = this.index.find(query);
    return results.map(m => ({
      schemaId: m.$id,
      title: m.title,
      category: m.category,
      filePath: m.filePath,
      version: m.version,
      depCount: m.dependencies.length,
    }));
  }

  getDependencies(schemaId: SchemaId): SchemaId[] {
    return this.graph.getChildren(schemaId);
  }

  getDependents(schemaId: SchemaId): SchemaId[] {
    return this.graph.getParents(schemaId);
  }

  getAncestors(schemaId: SchemaId): SchemaId[] {
    return this.graph.getAncestors(schemaId);
  }

  getDescendants(schemaId: SchemaId): SchemaId[] {
    return this.graph.getDescendants(schemaId);
  }

  getTopologicalOrder(): SchemaId[] {
    return this.graph.topologicalSort();
  }

  impactAnalysis(schemaId: SchemaId): { direct: SchemaId[]; transitive: SchemaId[]; all: SchemaId[] } {
    return this.graph.impactAnalysis(schemaId);
  }

  statistics(): RegistryStats {
    const cacheStats = this.cache.getStats();
    return {
      totalSchemas: this.index.totalSchemas,
      categories: this.index.getCategoryCounts(),
      totalCompiled: cacheStats.size,
      cacheHitRate: cacheStats.hitRate,
      cacheMissRate: 1 - cacheStats.hitRate,
      uptime: Date.now() - this.startTime,
    };
  }

  validateRegistry(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!this.isLoaded) {
      issues.push('Registry not loaded');
      return { valid: false, issues };
    }

    const all = this.list();
    if (all.length === 0) {
      issues.push('No schemas registered');
    }

    const cycleCheck = this.graph.hasCycles();
    if (cycleCheck.hasCycles) {
      issues.push(`Found ${String(cycleCheck.cycles?.length ?? 0)} dependency cycles`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  get isLoadedState(): boolean {
    return this.isLoaded;
  }
}
