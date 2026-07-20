import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { EntityCacheEntry } from './types';
import { RuntimeConfig } from './runtime-config';

@Injectable()
export class EntityCacheService {
  private readonly logger = new Logger(EntityCacheService.name);
  private readonly cache = new Map<string, EntityCacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly config: RuntimeConfig) {}

  get<T>(entityType: string, entityId: EntityId): T | undefined {
    const key = this.buildKey(entityType, entityId);
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
    return entry.entity as T;
  }

  set<T>(entityType: string, entityId: EntityId, entity: T): void {
    if (!this.config.enableCaching) return;
    const key = this.buildKey(entityType, entityId);
    this.evictIfNeeded();
    this.cache.set(key, {
      entity,
      expiresAt: Date.now() + this.config.entityCacheTtlMs,
    });
  }

  invalidate(entityType: string, entityId: EntityId): void {
    const key = this.buildKey(entityType, entityId);
    this.cache.delete(key);
  }

  invalidateAll(entityType?: string): void {
    if (!entityType) {
      this.cache.clear();
      return;
    }
    const prefix = `${entityType}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
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

  private buildKey(entityType: string, entityId: EntityId): string {
    return `${entityType}:${entityId}`;
  }

  private evictIfNeeded(): void {
    if (this.cache.size < this.config.cacheMaxSize) return;
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
