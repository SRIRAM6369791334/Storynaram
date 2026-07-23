import { Injectable, Logger } from '@nestjs/common';
import type { QueryResult, QueryStatistics, QueryEngineOptions } from './types.js';

interface CacheEntry {
  result: QueryResult;
  statistics: QueryStatistics;
  expiresAt: number;
}

@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private readonly enabled: boolean;
  private readonly defaultTtlMs: number;
  private readonly maxSize: number;

  constructor(options?: QueryEngineOptions) {
    this.enabled = options?.enableCache ?? true;
    this.defaultTtlMs = options?.cacheTtlMs ?? 30000;
    this.maxSize = 200;
  }

  get(key: string): QueryResult | undefined {
    if (!this.enabled) return undefined;
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.result;
  }

  set(key: string, result: QueryResult, ttlMs?: number): void {
    if (!this.enabled) return;
    this.evictIfNeeded();
    const statistics: QueryStatistics = {
      executionTimeMs: result.statistics?.executionTimeMs ?? 0,
      totalRows: result.total,
      cacheHit: true,
      relationshipsTraversed: result.statistics?.relationshipsTraversed ?? 0,
      repositoriesQueried: result.statistics?.repositoriesQueried ?? [],
      planComplexity: result.statistics?.planComplexity ?? 0,
      optimizationApplied: result.statistics?.optimizationApplied ?? [],
    };
    this.cache.set(key, {
      result: { ...result, statistics },
      statistics,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByEntityType(entityType: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${entityType}:`)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  buildKey(entityType: string, optionsHash: string): string {
    return `${entityType}:${optionsHash}`;
  }

  private evictIfNeeded(): void {
    if (this.cache.size < this.maxSize) return;
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.logger.debug(`Evicting oldest cache entry: ${oldestKey}`);
      this.cache.delete(oldestKey);
    }
  }
}
