import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchemaResolverService } from '../src/schema-resolver.service';
import { SchemaCacheService } from '../src/schema-cache.service';
import { CircularDependencyError } from '../src/errors';

function makeMeta(id: string, deps: string[], overrides: Record<string, unknown> = {}) {
  return {
    $id: id as any,
    title: id.split('/').pop() ?? id,
    category: 'core' as const,
    filePath: `schemas/core/${id.split('/').pop()}.schema.json`,
    dependencies: deps as any,
    dependents: [] as any,
    byteSize: 100,
    ...overrides,
  } as any;
}

function makeMetaMap(...metas: ReturnType<typeof makeMeta>): Map<any, any> {
  const map = new Map<any, any>();
  for (const m of metas) {
    map.set(m.$id, m);
  }
  return map;
}

describe('SchemaResolverService', () => {
  let resolver: SchemaResolverService;
  let cache: SchemaCacheService;

  beforeEach(() => {
    cache = new SchemaCacheService(100);
    const loader = {} as any;
    resolver = new SchemaResolverService(cache, loader);
  });

  it('should resolve dependencies between schemas', () => {
    const metas = makeMetaMap(
      makeMeta('https://example.com/A', ['B.schema.json']),
      makeMeta('https://example.com/B', ['C.schema.json']),
      makeMeta('https://example.com/C', []),
    );

    const resolved = resolver.resolveDependencies('https://example.com/A' as any, metas);
    expect(resolved).toContain('https://example.com/B' as any);
    expect(resolved).toContain('https://example.com/C' as any);
  });

  it('should return empty array for schema with no dependencies', () => {
    const meta = makeMeta('https://example.com/Standalone', []);
    const metas = makeMetaMap(meta);

    const resolved = resolver.resolveDependencies('https://example.com/Standalone' as any, metas);
    expect(resolved).toEqual([]);
  });

  it('should handle unknown schema ID gracefully', () => {
    const metas = makeMetaMap();
    const resolved = resolver.resolveDependencies('https://example.com/Unknown' as any, metas);
    expect(resolved).toEqual([]);
  });

  it('should skip unresolvable dependency references', () => {
    const metas = makeMetaMap(
      makeMeta('https://example.com/A', ['NonExistent.schema.json']),
    );

    const resolved = resolver.resolveDependencies('https://example.com/A' as any, metas);
    expect(resolved).toEqual([]);
  });

  it('should detect circular dependencies', () => {
    const metas = makeMetaMap(
      makeMeta('https://example.com/A', ['B.schema.json']),
      makeMeta('https://example.com/B', ['C.schema.json']),
      makeMeta('https://example.com/C', ['A.schema.json']),
    );

    expect(() =>
      resolver.resolveDependencies('https://example.com/A' as any, metas),
    ).toThrow(CircularDependencyError);
  });

  it('should detect self-referencing circular dependency', () => {
    const metas = makeMetaMap(
      makeMeta('https://example.com/A', ['A.schema.json']),
    );

    expect(() =>
      resolver.resolveDependencies('https://example.com/A' as any, metas),
    ).toThrow(CircularDependencyError);
  });

  it('should resolve all dependencies and populate cache', () => {
    const metas = makeMetaMap(
      makeMeta('https://example.com/A', ['B.schema.json']),
      makeMeta('https://example.com/B', ['C.schema.json']),
      makeMeta('https://example.com/C', []),
    );

    resolver.resolveAllDependencies(metas);

    const depsA = cache.getDependencies('https://example.com/A' as any);
    const depsB = cache.getDependencies('https://example.com/B' as any);
    const depsC = cache.getDependencies('https://example.com/C' as any);

    expect(depsA).toBeDefined();
    expect(depsA!).toContain('https://example.com/B' as any);
    expect(depsB!).toContain('https://example.com/C' as any);
    expect(depsC).toEqual([]);
  });

  it('should populate dependents during resolveAllDependencies', () => {
    const metaA = makeMeta('https://example.com/A', ['B.schema.json']);
    const metaB = makeMeta('https://example.com/B', []);
    const metas = makeMetaMap(metaA, metaB);

    resolver.resolveAllDependencies(metas);

    expect(metaA.dependents).toEqual([]);
    expect(metaB.dependents).toContain('https://example.com/A' as any);
  });

  it('should resolve dependencies by name matching', () => {
    const metas = makeMetaMap(
      makeMeta('https://example.com/A', ['MyDependency.schema.json']),
      makeMeta('https://example.com/MyDependency', []),
    );

    const resolved = resolver.resolveDependencies('https://example.com/A' as any, metas);
    expect(resolved).toContain('https://example.com/MyDependency' as any);
  });

  it('should compute reverse dependencies', () => {
    const metaA = makeMeta('https://example.com/A', ['B.schema.json']);
    const metaB = makeMeta('https://example.com/B', ['C.schema.json']);
    const metaC = makeMeta('https://example.com/C', []);
    const metas = makeMetaMap(metaA, metaB, metaC);

    resolver.resolveAllDependencies(metas);

    const revB = resolver.getReverseDependencies('https://example.com/B' as any, metas);
    expect(revB).toContain('https://example.com/A' as any);

    const revC = resolver.getReverseDependencies('https://example.com/C' as any, metas);
    expect(revC).toContain('https://example.com/B' as any);
  });

  it('should return empty array when no reverse dependencies exist', () => {
    const meta = makeMeta('https://example.com/Standalone', []);
    const metas = makeMetaMap(meta);

    resolver.resolveAllDependencies(metas);

    const rev = resolver.getReverseDependencies('https://example.com/Standalone' as any, metas);
    expect(rev).toEqual([]);
  });

  it('should handle multiple dependents for a single schema', () => {
    const metaA = makeMeta('https://example.com/A', ['Shared.schema.json']);
    const metaB = makeMeta('https://example.com/B', ['Shared.schema.json']);
    const metaShared = makeMeta('https://example.com/Shared', []);
    const metas = makeMetaMap(metaA, metaB, metaShared);

    resolver.resolveAllDependencies(metas);

    const rev = resolver.getReverseDependencies('https://example.com/Shared' as any, metas);
    expect(rev).toContain('https://example.com/A' as any);
    expect(rev).toContain('https://example.com/B' as any);
    expect(rev).toHaveLength(2);
  });

  it('should handle resolvable and unresolvable deps in resolveAll', () => {
    const metaA = makeMeta('https://example.com/A', ['B.schema.json', 'NoExists.schema.json']);
    const metaB = makeMeta('https://example.com/B', []);
    const metas = makeMetaMap(metaA, metaB);

    resolver.resolveAllDependencies(metas);

    const depsA = cache.getDependencies('https://example.com/A' as any);
    expect(depsA).toContain('https://example.com/B' as any);
    expect(depsA).not.toContain('NoExists.schema.json' as any);
  });
});
