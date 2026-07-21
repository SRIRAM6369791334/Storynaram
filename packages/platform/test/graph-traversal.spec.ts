import { describe, it, expect } from 'vitest';
import { GraphTraversal } from '../src/graph/graph-traversal';
import type { GraphNode, GraphEdge } from '../src/graph/graph-traversal';

const n1: GraphNode = { id: 'a', type: 'entity', domain: 'character', label: 'A' };
const n2: GraphNode = { id: 'b', type: 'entity', domain: 'world', label: 'B' };
const n3: GraphNode = { id: 'c', type: 'entity', domain: 'character', label: 'C' };
const n4: GraphNode = { id: 'd', type: 'entity', domain: 'timeline', label: 'D' };

const edges: GraphEdge[] = [
  { source: 'a', target: 'b', type: 'references', label: 'ref', weight: 1 },
  { source: 'b', target: 'c', type: 'references', label: 'ref', weight: 2 },
  { source: 'c', target: 'd', type: 'references', label: 'ref', weight: 1 },
];

const nodes = [n1, n2, n3, n4];

describe('GraphTraversal', () => {
  it('finds paths between two nodes', () => {
    const traversal = new GraphTraversal();
    const paths = traversal.findPaths(nodes, edges, 'a', 'd');
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]!.some(n => n.id === 'a')).toBe(true);
    expect(paths[0]!.some(n => n.id === 'd')).toBe(false);
  });

  it('finds paths from d to a (undirected adjacency)', () => {
    const traversal = new GraphTraversal();
    const paths = traversal.findPaths(nodes, edges, 'd', 'a');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('finds reachable nodes', () => {
    const traversal = new GraphTraversal();
    const reachable = traversal.findReachableNodes(nodes, edges, 'a');
    expect(reachable.has('b')).toBe(true);
    expect(reachable.has('c')).toBe(true);
    expect(reachable.has('d')).toBe(true);
  });

  it('respects max depth', () => {
    const traversal = new GraphTraversal();
    const reachable = traversal.findReachableNodes(nodes, edges, 'a', 1);
    expect(reachable.has('b')).toBe(true);
    expect(reachable.has('c')).toBe(false);
  });

  it('finds outgoing neighbors', () => {
    const traversal = new GraphTraversal();
    const neighbors = traversal.findNeighbors('a', edges, 'outgoing');
    expect(neighbors).toEqual(['b']);
  });

  it('finds incoming neighbors', () => {
    const traversal = new GraphTraversal();
    const neighbors = traversal.findNeighbors('d', edges, 'incoming');
    expect(neighbors).toEqual(['c']);
  });

  it('finds both incoming and outgoing neighbors', () => {
    const traversal = new GraphTraversal();
    const neighbors = traversal.findNeighbors('b', edges, 'both');
    expect(neighbors).toContain('a');
    expect(neighbors).toContain('c');
  });

  it('finds shortest path', () => {
    const traversal = new GraphTraversal();
    const path = traversal.shortestPath(nodes, edges, 'a', 'd');
    expect(path).not.toBeNull();
    expect(path!.map(n => n.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns null when no path for shortestPath', () => {
    const traversal = new GraphTraversal();
    const path = traversal.shortestPath(nodes, edges, 'd', 'a');
    expect(path).toBeNull();
  });

  it('returns empty neighbors for unknown node', () => {
    const traversal = new GraphTraversal();
    const neighbors = traversal.findNeighbors('unknown', edges);
    expect(neighbors).toHaveLength(0);
  });

  it('finds no reachable for start with no neighbors', () => {
    const traversal = new GraphTraversal();
    const singleNode: GraphNode[] = [{ id: 'x', type: 'e', domain: 'd', label: 'X' }];
    const reachable = traversal.findReachableNodes(singleNode, [], 'x');
    expect(reachable.size).toBe(0);
  });
});
