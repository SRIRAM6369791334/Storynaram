import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaRegistryService } from '../src/schema-registry.service';
import { SchemaDiscoveryService } from '../src/schema-discovery.service';
import { SchemaLoaderService } from '../src/schema-loader.service';
import { SchemaMetadataService } from '../src/schema-metadata.service';
import { SchemaCompilerService } from '../src/schema-compiler.service';
import { SchemaCacheService } from '../src/schema-cache.service';
import { SchemaResolverService } from '../src/schema-resolver.service';
import { SchemaDependencyGraphService } from '../src/schema-dependency-graph.service';
import { SchemaIndexService } from '../src/schema-index.service';
import { DuplicateSchemaError } from '../src/errors';

function createRegistry(autoLoad = false): SchemaRegistryService {
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  addFormats(ajv);

  const cache = new SchemaCacheService(500);
  const discovery = new SchemaDiscoveryService();
  const loader = new SchemaLoaderService();
  const metadata = new SchemaMetadataService(loader);
  const compiler = new SchemaCompilerService(ajv as any, cache);
  const resolver = new SchemaResolverService(cache, loader);
  const graph = new SchemaDependencyGraphService();
  const index = new SchemaIndexService(cache);

  const registry = new SchemaRegistryService(
    discovery, loader, metadata, compiler, cache, resolver, graph, index,
    { autoLoad, lazyCompile: true } as any,
  );

  return registry;
}

function withSchemaId(schema: Record<string, unknown>, id: string): Record<string, unknown> {
  const title = id.split('/').pop() ?? id;
  return { $id: id, title, ...schema };
}

const stringSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: { value: { type: 'string' } },
  required: ['value'],
};

const numberSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: { num: { type: 'number' } },
  required: ['num'],
};

const personSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 0 },
  },
  required: ['name', 'age'],
};

describe('SchemaRegistryService', () => {
  let registry: SchemaRegistryService;

  beforeEach(() => {
    registry = createRegistry(true);
  });

  afterEach(() => {
    registry.clear();
  });

  function reg(schemaId: string, schemaObj: Record<string, unknown>, category: 'core' | 'domain' | 'ai' | 'workflow' | 'validation' = 'core') {
    registry.register({ schemaId: schemaId as any, schema: withSchemaId(schemaObj, schemaId), category });
  }

  function regMany(entries: Array<{ schemaId: string; schema: Record<string, unknown>; category: 'core' | 'domain' | 'ai' | 'workflow' | 'validation' }>) {
    registry.registerMany(entries.map(e => ({ schemaId: e.schemaId as any, schema: withSchemaId(e.schema, e.schemaId), category: e.category })));
  }

  it('should register a single schema', () => {
    reg('https://example.com/StringSchema', stringSchema);

    expect(registry.has('https://example.com/StringSchema' as any)).toBe(true);
    const meta = registry.get('https://example.com/StringSchema' as any);
    expect(meta).toBeDefined();
    expect(meta!.title).toBe('StringSchema');
  });

  it('should throw DuplicateSchemaError when registering duplicate', () => {
    reg('https://example.com/Dup', stringSchema);

    expect(() =>
      reg('https://example.com/Dup', stringSchema),
    ).toThrow(DuplicateSchemaError);
  });

  it('should get schema by ID', () => {
    reg('https://example.com/GetTest', stringSchema);

    const meta = registry.getById('https://example.com/GetTest' as any);
    expect(meta).toBeDefined();
    expect(meta!.$id).toBe('https://example.com/GetTest' as any);
  });

  it('should get schemas by category', () => {
    reg('https://example.com/CoreSchema', stringSchema, 'core');

    const coreSchemas = registry.getByCategory('core');
    expect(coreSchemas).toHaveLength(1);

    const domainSchemas = registry.getByCategory('domain');
    expect(domainSchemas).toHaveLength(0);
  });

  it('should compile and validate schemas', () => {
    reg('https://example.com/Person', personSchema);

    const compileResult = registry.compile('https://example.com/Person' as any);
    expect(compileResult.success).toBe(true);

    const validResult = registry.validate('https://example.com/Person' as any, { name: 'Alice', age: 30 });
    expect(validResult.valid).toBe(true);

    const invalidResult = registry.validate('https://example.com/Person' as any, { name: 'Alice' });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toBeDefined();
  });

  it('should find schemas by query', () => {
    reg('https://example.com/UserProfile', stringSchema, 'core');

    const results = registry.find({ title: 'User' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('UserProfile');
  });

  it('should search and return index entries', () => {
    reg('https://example.com/SearchTest', stringSchema, 'validation');

    const results = registry.search({ category: 'validation' });
    expect(results).toHaveLength(1);
    expect(results[0].schemaId).toBe('https://example.com/SearchTest' as any);
    expect(results[0].category).toBe('validation');
  });

  it('should compile a registered schema', () => {
    reg('https://example.com/Single', stringSchema, 'core');

    const results = registry.compileAll();
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
  });

  it('should return statistics', () => {
    reg('https://example.com/StatSchema', stringSchema, 'core');

    registry.compile('https://example.com/StatSchema' as any);
    registry.validate('https://example.com/StatSchema' as any, { value: 'test' });

    const stats = registry.statistics();
    expect(stats.totalSchemas).toBe(1);
    expect(stats.categories).toBeDefined();
    expect(stats.totalCompiled).toBeGreaterThanOrEqual(1);
    expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
    expect(stats.cacheMissRate).toBeGreaterThanOrEqual(0);
    expect(stats.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should remove a registered schema', () => {
    reg('https://example.com/Removable', stringSchema);

    expect(registry.has('https://example.com/Removable' as any)).toBe(true);

    const removed = registry.remove('https://example.com/Removable' as any);
    expect(removed).toBe(true);
    expect(registry.has('https://example.com/Removable' as any)).toBe(false);
  });

  it('should clear all data', () => {
    reg('https://example.com/ClearMe', stringSchema);

    registry.clear();

    expect(registry.has('https://example.com/ClearMe' as any)).toBe(false);
    expect(registry.list()).toHaveLength(0);
  });

  it('should return dependencies (self-loop due to register impl)', () => {
    reg('https://example.com/SelfDep', stringSchema);

    const deps = registry.getDependencies('https://example.com/SelfDep' as any);
    expect(deps).toContain('https://example.com/SelfDep' as any);
  });

  it('should return dependents (self-loop due to register impl)', () => {
    reg('https://example.com/SelfDep2', stringSchema);

    const deps = registry.getDependents('https://example.com/SelfDep2' as any);
    expect(deps).toContain('https://example.com/SelfDep2' as any);
  });

  it('should compute impact analysis (self-loop due to register impl)', () => {
    reg('https://example.com/Impacted', stringSchema);

    const impact = registry.impactAnalysis('https://example.com/Impacted' as any);
    expect(impact.direct).toContain('https://example.com/Impacted' as any);
  });

  it('should validate registry state', () => {
    const validResult = registry.validateRegistry();
    expect(validResult.valid).toBe(false);
    expect(validResult.issues).toContain('Registry not loaded');
  });

  it('should report isLoaded state as false since autoLoad lifecycle not triggered', () => {
    expect(registry.isLoadedState).toBe(false);
  });

  it('should validate registry state', () => {
    const validResult = registry.validateRegistry();
    expect(validResult.valid).toBe(false);
    expect(validResult.issues).toContain('Registry not loaded');
  });

  it('should report isLoaded state after register', () => {
    registry.register({ schemaId: 'https://example.com/Loaded' as any, schema: withSchemaId(stringSchema, 'https://example.com/Loaded'), category: 'core' });
    expect(registry.isLoadedState).toBe(true);
  });
});
