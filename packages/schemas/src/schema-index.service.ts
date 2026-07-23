import { Injectable } from '@nestjs/common';
import type { SchemaMeta, SchemaId, SchemaCategory, SchemaIndexEntry, SchemaSearchQuery } from './types.js';
import { SchemaCacheService } from './schema-cache.service.js';

@Injectable()
export class SchemaIndexService {
  private readonly byId = new Map<SchemaId, SchemaMeta>();
  private readonly byTitle = new Map<string, SchemaMeta>();
  private readonly byCategory = new Map<SchemaCategory, SchemaMeta[]>();
  private readonly byFilePath = new Map<string, SchemaMeta>();

  constructor(private readonly cache: SchemaCacheService) {}

  build(metas: SchemaMeta[]): void {
    this.clear();
    for (const meta of metas) {
      this.byId.set(meta.$id, meta);
      this.byTitle.set(meta.title, meta);
      this.byFilePath.set(meta.filePath, meta);

      const existing = this.byCategory.get(meta.category) ?? [];
      existing.push(meta);
      this.byCategory.set(meta.category, existing);

      this.cache.setMeta(meta.$id, meta);
    }
  }

  getById(schemaId: SchemaId): SchemaMeta | undefined {
    return this.byId.get(schemaId) ?? this.cache.getMeta(schemaId);
  }

  getByTitle(title: string): SchemaMeta | undefined {
    return this.byTitle.get(title);
  }

  getByCategory(category: SchemaCategory): SchemaMeta[] {
    return this.byCategory.get(category) ?? [];
  }

  getByFilePath(filePath: string): SchemaMeta | undefined {
    return this.byFilePath.get(filePath);
  }

  has(schemaId: SchemaId): boolean {
    return this.byId.has(schemaId);
  }

  list(): SchemaIndexEntry[] {
    const entries: SchemaIndexEntry[] = [];
    for (const [, meta] of this.byId) {
      entries.push({
        schemaId: meta.$id,
        title: meta.title,
        category: meta.category,
        filePath: meta.filePath,
        version: meta.version,
        depCount: meta.dependencies.length,
      });
    }
    return entries.sort((a, b) => a.schemaId.localeCompare(b.schemaId));
  }

  find(query: SchemaSearchQuery): SchemaMeta[] {
    let results = [...this.byId.values()];

    if (query.title) {
      const lower = query.title.toLowerCase();
      results = results.filter(m => m.title.toLowerCase().includes(lower));
    }
    if (query.category) {
      results = results.filter(m => m.category === query.category);
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? results.length;

    return results.slice(offset, offset + limit);
  }

  remove(schemaId: SchemaId): boolean {
    const meta = this.byId.get(schemaId);
    if (!meta) return false;

    this.byId.delete(schemaId);
    this.byTitle.delete(meta.title);
    this.byFilePath.delete(meta.filePath);

    const catEntries = this.byCategory.get(meta.category);
    if (catEntries) {
      this.byCategory.set(meta.category, catEntries.filter(m => m.$id !== schemaId));
    }

    return true;
  }

  getCategoryCounts(): Record<SchemaCategory, number> {
    const counts = {} as Record<SchemaCategory, number>;
    for (const [cat, metas] of this.byCategory) {
      if (metas.length > 0) {
        counts[cat] = metas.length;
      }
    }
    return counts;
  }

  clear(): void {
    this.byId.clear();
    this.byTitle.clear();
    this.byCategory.clear();
    this.byFilePath.clear();
  }

  get totalSchemas(): number {
    return this.byId.size;
  }
}
