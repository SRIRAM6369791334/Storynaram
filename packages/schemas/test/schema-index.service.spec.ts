import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchemaIndexService } from '../src/schema-index.service';
import { SchemaCacheService } from '../src/schema-cache.service';

function makeMeta(id: string, overrides: Record<string, unknown> = {}) {
  const title = id.split('/').pop() ?? id;
  return {
    $id: id as any,
    title: title,
    description: `Description for ${title}`,
    category: 'core' as const,
    filePath: `schemas/core/${title}.schema.json`,
    dependencies: [] as any,
    dependents: [] as any,
    byteSize: 100,
    version: '1.0.0',
    ...overrides,
  } as any;
}

describe('SchemaIndexService', () => {
  let index: SchemaIndexService;
  let cache: SchemaCacheService;

  beforeEach(() => {
    cache = new SchemaCacheService(100);
    index = new SchemaIndexService(cache);
  });

  it('should build indexes from metas', () => {
    const metas = [
      makeMeta('https://example.com/A', { category: 'core' }),
      makeMeta('https://example.com/B', { category: 'domain' }),
    ];
    index.build(metas);

    expect(index.totalSchemas).toBe(2);
    expect(index.has('https://example.com/A' as any)).toBe(true);
    expect(index.has('https://example.com/B' as any)).toBe(true);
  });

  it('should find schema by ID', () => {
    const meta = makeMeta('https://example.com/Test1');
    index.build([meta]);

    const found = index.getById('https://example.com/Test1' as any);
    expect(found).toBeDefined();
    expect(found!.$id).toBe('https://example.com/Test1' as any);
  });

  it('should return undefined for unknown ID', () => {
    expect(index.getById('unknown' as any)).toBeUndefined();
  });

  it('should fall back to cache for getById if not in index', () => {
    const meta = makeMeta('https://example.com/Cached');
    cache.setMeta('https://example.com/Cached' as any, meta);

    const found = index.getById('https://example.com/Cached' as any);
    expect(found).toBe(meta);
  });

  it('should find schema by title', () => {
    const meta = makeMeta('https://example.com/TestTitle');
    index.build([meta]);

    const found = index.getByTitle('TestTitle');
    expect(found).toBeDefined();
    expect(found!.$id).toBe('https://example.com/TestTitle' as any);
  });

  it('should find schemas by category', () => {
    const metas = [
      makeMeta('https://example.com/Core1', { category: 'core' }),
      makeMeta('https://example.com/Core2', { category: 'core' }),
      makeMeta('https://example.com/Domain1', { category: 'domain' }),
    ];
    index.build(metas);

    const coreSchemas = index.getByCategory('core');
    expect(coreSchemas).toHaveLength(2);

    const domainSchemas = index.getByCategory('domain');
    expect(domainSchemas).toHaveLength(1);

    const aiSchemas = index.getByCategory('ai');
    expect(aiSchemas).toHaveLength(0);
  });

  it('should find schema by filePath', () => {
    const meta = makeMeta('https://example.com/FilePathTest', { filePath: 'custom/location/file.json' });
    index.build([meta]);

    const found = index.getByFilePath('custom/location/file.json');
    expect(found).toBeDefined();
    expect(found!.$id).toBe('https://example.com/FilePathTest' as any);
  });

  it('should list all entries sorted by schemaId', () => {
    const metas = [
      makeMeta('https://example.com/Beta'),
      makeMeta('https://example.com/Alpha'),
    ];
    index.build(metas);

    const entries = index.list();
    expect(entries).toHaveLength(2);
    expect(entries[0].schemaId).toBe('https://example.com/Alpha' as any);
    expect(entries[1].schemaId).toBe('https://example.com/Beta' as any);
  });

  it('should include all fields in list entries', () => {
    const meta = makeMeta('https://example.com/FullEntry', {
      category: 'domain',
      filePath: 'schemas/domain/FullEntry.schema.json',
      version: '2.0.0',
      dependencies: ['dep1'] as any,
    });
    index.build([meta]);

    const entries = index.list();
    expect(entries[0]).toEqual({
      schemaId: 'https://example.com/FullEntry' as any,
      title: 'FullEntry',
      category: 'domain',
      filePath: 'schemas/domain/FullEntry.schema.json',
      version: '2.0.0',
      depCount: 1,
    });
  });

  it('should search and filter by title', () => {
    const metas = [
      makeMeta('https://example.com/UserProfile'),
      makeMeta('https://example.com/UserSettings'),
      makeMeta('https://example.com/AdminPanel'),
    ];
    index.build(metas);

    const results = index.find({ title: 'User' });
    expect(results).toHaveLength(2);
  });

  it('should search and filter by category', () => {
    const metas = [
      makeMeta('https://example.com/CoreOnly', { category: 'core' }),
      makeMeta('https://example.com/AlsoCore', { category: 'core' }),
    ];
    index.build(metas);

    const results = index.find({ category: 'core' });
    expect(results).toHaveLength(2);

    const domainResults = index.find({ category: 'domain' });
    expect(domainResults).toHaveLength(0);
  });

  it('should combine title and category filter', () => {
    const metas = [
      makeMeta('https://example.com/CoreUser', { category: 'core', title: 'CoreUser' }),
      makeMeta('https://example.com/DomainUser', { category: 'domain', title: 'DomainUser' }),
      makeMeta('https://example.com/CoreAdmin', { category: 'core', title: 'CoreAdmin' }),
    ];
    index.build(metas);

    const results = index.find({ title: 'User', category: 'core' });
    expect(results).toHaveLength(1);
    expect(results[0].$id).toBe('https://example.com/CoreUser' as any);
  });

  it('should support pagination in find', () => {
    const metas = Array.from({ length: 10 }, (_, i) =>
      makeMeta(`https://example.com/Schema${i}`),
    );
    index.build(metas);

    const page1 = index.find({ offset: 0, limit: 3 });
    expect(page1).toHaveLength(3);

    const page2 = index.find({ offset: 3, limit: 3 });
    expect(page2).toHaveLength(3);

    expect(page1[0].$id).not.toBe(page2[0].$id);
  });

  it('should handle remove operation', () => {
    const meta = makeMeta('https://example.com/Removable');
    index.build([meta]);

    expect(index.has('https://example.com/Removable' as any)).toBe(true);
    expect(index.totalSchemas).toBe(1);

    const removed = index.remove('https://example.com/Removable' as any);
    expect(removed).toBe(true);
    expect(index.has('https://example.com/Removable' as any)).toBe(false);
    expect(index.totalSchemas).toBe(0);
  });

  it('should return false when removing non-existent schema', () => {
    const removed = index.remove('https://example.com/DoesNotExist' as any);
    expect(removed).toBe(false);
  });

  it('should update category counts after remove', () => {
    const metas = [
      makeMeta('https://example.com/A', { category: 'core' }),
      makeMeta('https://example.com/B', { category: 'core' }),
    ];
    index.build(metas);

    expect(index.getCategoryCounts().core).toBe(2);

    index.remove('https://example.com/A' as any);
    expect(index.getCategoryCounts().core).toBe(1);
  });

  it('should return category counts', () => {
    const metas = [
      makeMeta('https://example.com/A', { category: 'core' }),
      makeMeta('https://example.com/B', { category: 'domain' }),
      makeMeta('https://example.com/C', { category: 'core' }),
      makeMeta('https://example.com/D', { category: 'ai' }),
    ];
    index.build(metas);

    const counts = index.getCategoryCounts();
    expect(counts.core).toBe(2);
    expect(counts.domain).toBe(1);
    expect(counts.ai).toBe(1);
  });

  it('should return empty object for category counts when no metas', () => {
    const counts = index.getCategoryCounts();
    expect(counts).toEqual({});
  });

  it('should clear all data', () => {
    index.build([makeMeta('https://example.com/A')]);
    expect(index.totalSchemas).toBe(1);

    index.clear();
    expect(index.totalSchemas).toBe(0);
    expect(index.list()).toEqual([]);
  });

  it('should handle multiple builds (rebuild)', () => {
    const metas1 = [makeMeta('https://example.com/A')];
    index.build(metas1);
    expect(index.totalSchemas).toBe(1);

    const metas2 = [makeMeta('https://example.com/B')];
    index.build(metas2);
    expect(index.totalSchemas).toBe(1);
    expect(index.has('https://example.com/A' as any)).toBe(false);
    expect(index.has('https://example.com/B' as any)).toBe(true);
  });

  it('should store metadata in cache during build', () => {
    const meta = makeMeta('https://example.com/CacheCheck');
    index.build([meta]);

    const cached = cache.getMeta('https://example.com/CacheCheck' as any);
    expect(cached).toBeDefined();
    expect(cached!.$id).toBe('https://example.com/CacheCheck' as any);
  });
});
