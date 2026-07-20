import { Injectable } from '@nestjs/common';
import type { ValidationEngineResult } from './types';

interface CacheEntry {
  result: ValidationEngineResult;
  created: number;
}

@Injectable()
export class ValidationCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): ValidationEngineResult | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.result;
  }

  set(key: string, result: ValidationEngineResult): void {
    if (this.cache.size >= this.maxSize) {
      let oldest = Infinity;
      let oldestKey: string | undefined;
      for (const [k, v] of this.cache) {
        if (v.created < oldest) {
          oldest = v.created;
          oldestKey = k;
        }
      }
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { result, created: Date.now() });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }
}
