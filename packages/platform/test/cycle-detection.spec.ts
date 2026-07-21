import { describe, it, expect } from 'vitest';
import { CycleDetection } from '../src/graph/cycle-detection';
import type { GraphEdge } from '../src/graph/graph-traversal';

describe('CycleDetection', () => {
  it('detects no cycles in a DAG', () => {
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', type: 'dep', label: '', weight: 1 },
      { source: 'b', target: 'c', type: 'dep', label: '', weight: 1 },
    ];
    const result = new CycleDetection().detect(edges);
    expect(result.hasCycle).toBe(false);
    expect(result.cycles).toHaveLength(0);
  });

  it('detects a simple cycle', () => {
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', type: 'dep', label: '', weight: 1 },
      { source: 'b', target: 'c', type: 'dep', label: '', weight: 1 },
      { source: 'c', target: 'a', type: 'dep', label: '', weight: 1 },
    ];
    const result = new CycleDetection().detect(edges);
    expect(result.hasCycle).toBe(true);
    expect(result.cycles.length).toBeGreaterThan(0);
    expect(result.involvedNodes).toContain('a');
    expect(result.involvedNodes).toContain('b');
    expect(result.involvedNodes).toContain('c');
  });

  it('detects a cycle involving two nodes', () => {
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', type: 'dep', label: '', weight: 1 },
      { source: 'b', target: 'a', type: 'dep', label: '', weight: 1 },
    ];
    const result = new CycleDetection().detect(edges);
    expect(result.hasCycle).toBe(true);
  });

  it('detects self-loop', () => {
    const edges: GraphEdge[] = [
      { source: 'a', target: 'a', type: 'dep', label: '', weight: 1 },
    ];
    const result = new CycleDetection().detect(edges);
    expect(result.hasCycle).toBe(true);
  });

  it('returns empty for no edges', () => {
    const result = new CycleDetection().detect([]);
    expect(result.hasCycle).toBe(false);
    expect(result.cycles).toHaveLength(0);
  });

  it('detects cycles within a subset of nodes', () => {
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', type: 'dep', label: '', weight: 1 },
      { source: 'b', target: 'c', type: 'dep', label: '', weight: 1 },
      { source: 'c', target: 'a', type: 'dep', label: '', weight: 1 },
      { source: 'd', target: 'e', type: 'dep', label: '', weight: 1 },
    ];
    const result = new CycleDetection().detectBetween(edges, ['a', 'b', 'c']);
    expect(result.hasCycle).toBe(true);
  });

  it('detects no cycle in subset without cycles', () => {
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', type: 'dep', label: '', weight: 1 },
      { source: 'b', target: 'c', type: 'dep', label: '', weight: 1 },
      { source: 'c', target: 'a', type: 'dep', label: '', weight: 1 },
    ];
    const result = new CycleDetection().detectBetween(edges, ['d']);
    expect(result.hasCycle).toBe(false);
  });
});
