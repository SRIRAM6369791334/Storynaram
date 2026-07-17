import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaDependencyGraphService } from '../src/schema-dependency-graph.service';
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

describe('SchemaDependencyGraphService', () => {
  let graph: SchemaDependencyGraphService;

  beforeEach(() => {
    graph = new SchemaDependencyGraphService();
  });

  it('should build graph from metas', () => {
    const metas = [
      makeMeta('https://example.com/A', ['B.schema.json']),
      makeMeta('https://example.com/B', []),
    ];
    graph.build(metas);

    expect(graph.size).toBe(2);
    expect(graph.getChildren('https://example.com/A' as any)).toEqual(['https://example.com/B' as any]);
    expect(graph.getChildren('https://example.com/B' as any)).toEqual([]);
  });

  it('should resolve children and parents', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('A' as any, 'C' as any);
    graph.addEdge('B' as any, 'C' as any);

    expect(graph.getChildren('A' as any)).toEqual(['B' as any, 'C' as any].map(String));
    expect(graph.getParents('C' as any)).toEqual(['A' as any, 'B' as any].map(String));
    expect(graph.getParents('A' as any)).toEqual([]);
    expect(graph.getChildren('C' as any)).toEqual([]);
  });

  it('should detect circular dependencies', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('B' as any, 'C' as any);
    graph.addEdge('C' as any, 'A' as any);

    const result = graph.hasCycles();
    expect(result.hasCycles).toBe(true);
    expect(result.cycles).toBeDefined();
    expect(result.cycles!.length).toBeGreaterThan(0);
  });

  it('should report no cycles for a DAG', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('B' as any, 'C' as any);

    const result = graph.hasCycles();
    expect(result.hasCycles).toBe(false);
    expect(result.cycles).toBeUndefined();
  });

  it('should throw CircularDependencyError on topological sort of cyclic graph', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('B' as any, 'A' as any);

    expect(() => graph.topologicalSort()).toThrow(CircularDependencyError);
  });

  it('should produce topological ordering', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('A' as any, 'C' as any);
    graph.addEdge('B' as any, 'D' as any);
    graph.addEdge('C' as any, 'D' as any);

    const order = graph.topologicalSort();
    expect(order.indexOf('D' as any)).toBeGreaterThan(order.indexOf('B' as any));
    expect(order.indexOf('D' as any)).toBeGreaterThan(order.indexOf('C' as any));
    expect(order.indexOf('B' as any)).toBeGreaterThan(order.indexOf('A' as any));
    expect(order.indexOf('C' as any)).toBeGreaterThan(order.indexOf('A' as any));
  });

  it('should handle self-loops in topological sort', () => {
    graph.addEdge('A' as any, 'A' as any);

    expect(() => graph.topologicalSort()).toThrow(CircularDependencyError);
  });

  it('should clear correctly', () => {
    graph.addEdge('A' as any, 'B' as any);
    expect(graph.size).toBe(2);

    graph.clear();
    expect(graph.size).toBe(0);
    expect(graph.getChildren('A' as any)).toEqual([]);
    expect(graph.getParents('B' as any)).toEqual([]);
  });

  it('should compute impact analysis', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('B' as any, 'C' as any);

    const impact = graph.impactAnalysis('C' as any);
    expect(impact.direct).toEqual(['B' as any]);
    expect(impact.transitive).toEqual(['A' as any]);
    expect(impact.all).toEqual(['B' as any, 'A' as any]);
  });

  it('should compute impact analysis with no dependents', () => {
    const impact = graph.impactAnalysis('A' as any);
    expect(impact.direct).toEqual([]);
    expect(impact.transitive).toEqual([]);
    expect(impact.all).toEqual([]);
  });

  it('should compute ancestors and descendants', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('B' as any, 'C' as any);
    graph.addEdge('C' as any, 'D' as any);

    expect(graph.getAncestors('D' as any)).toEqual(['C' as any, 'B' as any, 'A' as any]);
    expect(graph.getDescendants('A' as any)).toEqual(['B' as any, 'C' as any, 'D' as any]);
  });

  it('should handle diamond-shaped dependencies', () => {
    graph.addEdge('Root' as any, 'Left' as any);
    graph.addEdge('Root' as any, 'Right' as any);
    graph.addEdge('Left' as any, 'Leaf' as any);
    graph.addEdge('Right' as any, 'Leaf' as any);

    const order = graph.topologicalSort();
    expect(order.indexOf('Leaf' as any)).toBeGreaterThan(order.indexOf('Left' as any));
    expect(order.indexOf('Leaf' as any)).toBeGreaterThan(order.indexOf('Right' as any));
    expect(order.indexOf('Left' as any)).toBeGreaterThan(order.indexOf('Root' as any));
    expect(order.indexOf('Right' as any)).toBeGreaterThan(order.indexOf('Root' as any));
  });

  it('should build graph with metas using name matching', () => {
    const metas = [
      makeMeta('https://example.com/BaseEntity', ['BaseIdentifier.schema.json', 'BaseMetadata.schema.json']),
      makeMeta('https://example.com/BaseIdentifier', []),
      makeMeta('https://example.com/BaseMetadata', []),
    ];
    graph.build(metas);

    const children = graph.getChildren('https://example.com/BaseEntity' as any);
    expect(children).toContain('https://example.com/BaseIdentifier' as any);
    expect(children).toContain('https://example.com/BaseMetadata' as any);
  });

  it('should handle empty metas', () => {
    graph.build([]);
    expect(graph.size).toBe(0);
    expect(graph.topologicalSort()).toEqual([]);
  });

  it('should handle disconnected nodes', () => {
    graph.addEdge('A' as any, 'B' as any);
    graph.addEdge('C' as any, 'D' as any);

    const order = graph.topologicalSort();
    expect(order).toContain('A' as any);
    expect(order).toContain('B' as any);
    expect(order).toContain('C' as any);
    expect(order).toContain('D' as any);
    expect(order.indexOf('A' as any)).toBeLessThan(order.indexOf('B' as any));
    expect(order.indexOf('C' as any)).toBeLessThan(order.indexOf('D' as any));
  });
});
