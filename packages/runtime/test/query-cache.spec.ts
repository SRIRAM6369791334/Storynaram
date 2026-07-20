import { describe, it, expect, beforeEach } from 'vitest';
import { QueryCacheService } from '../src/query/query-cache.service';
import type { QueryResult } from '../src/query/types';

describe('QueryCacheService', () => {
  let cache: QueryCacheService;

  beforeEach(() => {
    cache = new QueryCacheService({ enableCache: true, cacheTtlMs: 60000 });
  });

  it('should store and retrieve cached results', () => {
    const result: QueryResult = { data: [{ id: '1', name: 'Alice' }], total: 1 };
    cache.set('test-key', result);
    const cached = cache.get('test-key');
    expect(cached).toBeDefined();
    expect(cached!.data).toHaveLength(1);
    expect(cached!.total).toBe(1);
  });

  it('should return undefined for missing key', () => {
    const cached = cache.get('nonexistent');
    expect(cached).toBeUndefined();
  });

  it('should respect TTL', async () => {
    const shortCache = new QueryCacheService({ enableCache: true, cacheTtlMs: 50 });
    const result: QueryResult = { data: [{ id: '1' }], total: 1 };
    shortCache.set('ttl-key', result);
    await new Promise(resolve => setTimeout(resolve, 100));
    const cached = shortCache.get('ttl-key');
    expect(cached).toBeUndefined();
  });

  it('should invalidate specific key', () => {
    const result: QueryResult = { data: [], total: 0 };
    cache.set('key1', result);
    cache.set('key2', result);
    cache.invalidate('key1');
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeDefined();
  });

  it('should invalidate by entity type', () => {
    const result: QueryResult = { data: [], total: 0 };
    cache.set(cache.buildKey('character', 'q1'), result);
    cache.set(cache.buildKey('character', 'q2'), result);
    cache.set(cache.buildKey('world', 'q1'), result);
    cache.invalidateByEntityType('character');
    expect(cache.get(cache.buildKey('character', 'q1'))).toBeUndefined();
    expect(cache.get(cache.buildKey('character', 'q2'))).toBeUndefined();
    expect(cache.get(cache.buildKey('world', 'q1'))).toBeDefined();
  });

  it('should invalidate all', () => {
    const result: QueryResult = { data: [], total: 0 };
    cache.set('a', result);
    cache.set('b', result);
    cache.invalidateAll();
    expect(cache.stats().size).toBe(0);
  });

  it('should track hit rate', () => {
    const result: QueryResult = { data: [], total: 0 };
    cache.set('key', result);
    cache.get('key');
    cache.get('key');
    cache.get('missing');
    const stats = cache.stats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it('should not cache when disabled', () => {
    const disabledCache = new QueryCacheService({ enableCache: false });
    const result: QueryResult = { data: [], total: 0 };
    disabledCache.set('key', result);
    expect(disabledCache.get('key')).toBeUndefined();
  });

  it('should evict oldest entry when at capacity', () => {
    const smallCache = new QueryCacheService({ enableCache: true, cacheTtlMs: 60000 });
    (smallCache as any).maxSize = 2;
    const result: QueryResult = { data: [], total: 0 };
    smallCache.set('a', result);
    smallCache.set('b', result);
    smallCache.set('c', result);
    expect(smallCache.stats().size).toBe(2);
  });

  it('should build consistent keys', () => {
    const key1 = cache.buildKey('character', 'query-a');
    const key2 = cache.buildKey('character', 'query-a');
    const key3 = cache.buildKey('world', 'query-a');
    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });
});
