import { Injectable } from '@nestjs/common';
import type { SchemaMeta, SchemaId } from './types';

interface CacheEntry<T> {
  value: T;
  created: number;
  accessed: number;
  hits: number;
}

@Injectable()
export class SchemaCacheService {
  private readonly metas = new Map<SchemaId, CacheEntry<SchemaMeta>>();
  private readonly compiled = new Map<SchemaId, CacheEntry<object>>();
  private readonly raw = new Map<string, CacheEntry<Record<string, unknown>>>();
  private readonly dependencies = new Map<SchemaId, CacheEntry<SchemaId[]>>();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  getMeta(schemaId: SchemaId): SchemaMeta | undefined {
    return this.get(this.metas, schemaId);
  }

  setMeta(schemaId: SchemaId, meta: SchemaMeta): void {
    this.set(this.metas, schemaId, meta);
  }

  getCompiled(schemaId: SchemaId): object | undefined {
    return this.get(this.compiled, schemaId);
  }

  setCompiled(schemaId: SchemaId, validator: object): void {
    this.set(this.compiled, schemaId, validator);
  }

  hasCompiled(schemaId: SchemaId): boolean {
    return this.compiled.has(schemaId);
  }

  getRaw(key: string): Record<string, unknown> | undefined {
    return this.get(this.raw, key);
  }

  setRaw(key: string, raw: Record<string, unknown>): void {
    this.set(this.raw, key, raw);
  }

  getDependencies(schemaId: SchemaId): SchemaId[] | undefined {
    return this.get(this.dependencies, schemaId);
  }

  setDependencies(schemaId: SchemaId, deps: SchemaId[]): void {
    this.set(this.dependencies, schemaId, deps);
  }

  clear(): void {
    this.metas.clear();
    this.compiled.clear();
    this.raw.clear();
    this.dependencies.clear();
    this.hits = 0;
    this.misses = 0;
  }

  clearCompiled(): void {
    this.compiled.clear();
  }

  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.metas.size + this.compiled.size + this.raw.size + this.dependencies.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  private get<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
    const entry = cache.get(key);
    if (entry === undefined) {
      this.misses++;
      return undefined;
    }
    entry.accessed = Date.now();
    entry.hits++;
    this.hits++;
    return entry.value;
  }

  private set<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void {
    if (cache.size >= this.maxSize) {
      // Evict least recently used
      let oldest = Infinity;
      let oldestKey: string | undefined;
      for (const [k, v] of cache) {
        if (v.accessed < oldest) {
          oldest = v.accessed;
          oldestKey = k;
        }
      }
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
    cache.set(key, { value, created: Date.now(), accessed: Date.now(), hits: 0 });
  }
}
