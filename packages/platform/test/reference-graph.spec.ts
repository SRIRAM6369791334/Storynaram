import { describe, it, expect } from 'vitest';
import { ReferenceGraph } from '../src/graph/reference-graph';

describe('ReferenceGraph', () => {
  it('adds and retrieves entries', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({
      sourceId: 'char-1', sourceDomain: 'character', sourceType: 'hero',
      targetId: 'world-1', targetDomain: 'world', targetType: 'location',
      referenceType: 'lives-in',
    });
    expect(graph.getEntryCount()).toBe(1);
    const all = graph.getAllEntries();
    expect(all).toHaveLength(1);
    expect(all[0]!.referenceType).toBe('lives-in');
  });

  it('adds multiple entries', () => {
    const graph = new ReferenceGraph();
    graph.addEntries([
      { sourceId: 'a', sourceDomain: 'd1', sourceType: 't1', targetId: 'b', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' },
      { sourceId: 'b', sourceDomain: 'd2', sourceType: 't2', targetId: 'c', targetDomain: 'd3', targetType: 't3', referenceType: 'ref' },
    ]);
    expect(graph.getEntryCount()).toBe(2);
  });

  it('finds references to an entity', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'a', sourceDomain: 'd1', sourceType: 't1', targetId: 'x', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    graph.addEntry({ sourceId: 'b', sourceDomain: 'd2', sourceType: 't2', targetId: 'x', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    graph.addEntry({ sourceId: 'c', sourceDomain: 'd3', sourceType: 't3', targetId: 'y', targetDomain: 'd4', targetType: 't4', referenceType: 'ref' });
    const refs = graph.findReferencesTo('x');
    expect(refs).toHaveLength(2);
  });

  it('finds references from an entity', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'x', sourceDomain: 'd1', sourceType: 't1', targetId: 'a', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    graph.addEntry({ sourceId: 'x', sourceDomain: 'd1', sourceType: 't1', targetId: 'b', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    const refs = graph.findReferencesFrom('x');
    expect(refs).toHaveLength(2);
  });

  it('finds references between domains', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'a', sourceDomain: 'character', sourceType: 't1', targetId: 'b', targetDomain: 'world', targetType: 't2', referenceType: 'ref' });
    graph.addEntry({ sourceId: 'c', sourceDomain: 'character', sourceType: 't1', targetId: 'd', targetDomain: 'world', targetType: 't2', referenceType: 'ref' });
    graph.addEntry({ sourceId: 'e', sourceDomain: 'character', sourceType: 't1', targetId: 'f', targetDomain: 'timeline', targetType: 't2', referenceType: 'ref' });
    const between = graph.findReferencesBetween('character', 'world');
    expect(between).toHaveLength(2);
  });

  it('converts to graph nodes', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'a', sourceDomain: 'd1', sourceType: 't1', targetId: 'b', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    const nodes = graph.toGraphNodes();
    expect(nodes.length).toBe(2);
  });

  it('converts to graph edges', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'a', sourceDomain: 'd1', sourceType: 't1', targetId: 'b', targetDomain: 'd2', targetType: 't2', referenceType: 'friends' });
    const edges = graph.toGraphEdges();
    expect(edges).toHaveLength(1);
    expect(edges[0]!.type).toBe('friends');
  });

  it('detects cycles in references', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'a', sourceDomain: 'd1', sourceType: 't1', targetId: 'b', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    graph.addEntry({ sourceId: 'b', sourceDomain: 'd2', sourceType: 't2', targetId: 'a', targetDomain: 'd1', targetType: 't1', referenceType: 'ref' });
    const result = graph.detectCycles();
    expect(result.hasCycle).toBe(true);
  });

  it('clears entries', () => {
    const graph = new ReferenceGraph();
    graph.addEntry({ sourceId: 'a', sourceDomain: 'd1', sourceType: 't1', targetId: 'b', targetDomain: 'd2', targetType: 't2', referenceType: 'ref' });
    graph.clear();
    expect(graph.getEntryCount()).toBe(0);
  });

  it('returns traversal and cycle detector', () => {
    const graph = new ReferenceGraph();
    expect(graph.getTraversal()).toBeDefined();
    expect(graph.getCycleDetector()).toBeDefined();
  });
});
