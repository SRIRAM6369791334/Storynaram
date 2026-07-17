import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SchemaCacheService } from '../src/schema-cache.service';

describe('SchemaCacheService', () => {
  let cache: SchemaCacheService;

  beforeEach(() => {
    cache = new SchemaCacheService(10);
  });

  it('should store and retrieve meta entries', () => {
    const meta = { $id: 'https://example.com/schema1', title: 'Schema1', category: 'core', filePath: '/a/b.json', dependencies: [], dependents: [], byteSize: 100 } as any;
    cache.setMeta('https://example.com/schema1' as any, meta);
    expect(cache.getMeta('https://example.com/schema1' as any)).toBe(meta);
  });

  it('should return undefined for missing meta', () => {
    expect(cache.getMeta('nonexistent' as any)).toBeUndefined();
  });

  it('should store and retrieve compiled validators', () => {
    const validator = { validate: () => true };
    cache.setCompiled('https://example.com/schema1' as any, validator);
    expect(cache.getCompiled('https://example.com/schema1' as any)).toBe(validator);
  });

  it('should report hasCompiled correctly', () => {
    expect(cache.hasCompiled('https://example.com/schema1' as any)).toBe(false);
    cache.setCompiled('https://example.com/schema1' as any, {});
    expect(cache.hasCompiled('https://example.com/schema1' as any)).toBe(true);
  });

  it('should return undefined for missing compiled validator', () => {
    expect(cache.getCompiled('nonexistent' as any)).toBeUndefined();
  });

  it('should store and retrieve raw schemas', () => {
    const raw = { type: 'object', properties: { name: { type: 'string' } } };
    cache.setRaw('fileA.json', raw);
    expect(cache.getRaw('fileA.json')).toBe(raw);
  });

  it('should store and retrieve dependencies', () => {
    const deps = ['dep1', 'dep2'] as any;
    cache.setDependencies('https://example.com/schema1' as any, deps);
    expect(cache.getDependencies('https://example.com/schema1' as any)).toBe(deps);
  });

  it('should track cache hits and misses', () => {
    cache.getMeta('missing1' as any);
    cache.getMeta('missing2' as any);
    cache.setMeta('existing' as any, {} as any);
    cache.getMeta('existing' as any);

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(2);
  });

  it('should return correct hit rate', () => {
    expect(cache.getStats().hitRate).toBe(0);

    cache.getMeta('missing' as any);
    cache.getMeta('missing' as any);
    let stats = cache.getStats();
    expect(stats.hitRate).toBe(0);

    cache.setMeta('hit' as any, {} as any);
    cache.getMeta('hit' as any);
    cache.getMeta('hit' as any);
    stats = cache.getStats();
    expect(stats.hitRate).toBe(2 / 4);
  });

  it('should clear all data and reset stats', () => {
    cache.setMeta('s1' as any, {} as any);
    cache.setCompiled('s1' as any, {});
    cache.setRaw('f1.json', {});
    cache.setDependencies('s1' as any, []);

    cache.getMeta('s1' as any);
    cache.getMeta('missing' as any);

    cache.clear();

    const stats = cache.getStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.size).toBe(0);

    expect(cache.getMeta('s1' as any)).toBeUndefined();
    expect(cache.getCompiled('s1' as any)).toBeUndefined();
    expect(cache.getRaw('f1.json')).toBeUndefined();
    expect(cache.getDependencies('s1' as any)).toBeUndefined();
  });

  it('should clear only compiled validators', () => {
    cache.setMeta('s1' as any, {} as any);
    cache.setCompiled('s1' as any, {});
    cache.clearCompiled();
    expect(cache.getMeta('s1' as any)).toBeDefined();
    expect(cache.getCompiled('s1' as any)).toBeUndefined();
  });

  it('should evict oldest entries when max size exceeded', () => {
    const smallCache = new SchemaCacheService(3);
    smallCache.setMeta('a' as any, { $id: 'a' } as any);
    smallCache.setMeta('b' as any, { $id: 'b' } as any);
    smallCache.setMeta('c' as any, { $id: 'c' } as any);
    smallCache.setMeta('d' as any, { $id: 'd' } as any);

    expect(smallCache.getMeta('a' as any)).toBeUndefined();
    expect(smallCache.getMeta('b' as any)).toBeDefined();
    expect(smallCache.getMeta('c' as any)).toBeDefined();
    expect(smallCache.getMeta('d' as any)).toBeDefined();
  });

  it('should evict least recently accessed entry when full', () => {
    vi.useFakeTimers();
    const smallCache = new SchemaCacheService(3);
    smallCache.setMeta('a' as any, { $id: 'a' } as any);

    vi.advanceTimersByTime(10);
    smallCache.setMeta('b' as any, { $id: 'b' } as any);

    vi.advanceTimersByTime(10);
    smallCache.setMeta('c' as any, { $id: 'c' } as any);

    vi.advanceTimersByTime(10);
    smallCache.getMeta('a' as any);

    vi.advanceTimersByTime(10);
    smallCache.setMeta('d' as any, { $id: 'd' } as any);

    expect(smallCache.getMeta('b' as any)).toBeUndefined();
    expect(smallCache.getMeta('a' as any)).toBeDefined();
    expect(smallCache.getMeta('c' as any)).toBeDefined();
    expect(smallCache.getMeta('d' as any)).toBeDefined();
    vi.useRealTimers();
  });

  it('should report correct size in stats', () => {
    cache.setMeta('s1' as any, {} as any);
    cache.setCompiled('s1' as any, {});
    cache.setRaw('f1.json', {});
    cache.setDependencies('s1' as any, []);

    const stats = cache.getStats();
    expect(stats.size).toBe(4);
  });
});
