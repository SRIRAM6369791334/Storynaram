import { bench, describe } from 'vitest';
import { GraphTraversal } from '../src/graph/graph-traversal';
import { CycleDetection } from '../src/graph/cycle-detection';
import { DependencyGraph } from '../src/graph/dependency-graph';
import type { GraphNode, GraphEdge } from '../src/graph/graph-traversal';

describe('GraphTraversal benchmarks', () => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  for (let i = 0; i < 100; i++) {
    nodes.push({ id: `n${i}`, type: 'entity', domain: 'test', label: `Node ${i}` });
    if (i > 0) {
      edges.push({ source: `n${i - 1}`, target: `n${i}`, type: 'chain', label: '', weight: 1 });
    }
  }

  bench('find reachable nodes', () => {
    new GraphTraversal().findReachableNodes(nodes, edges, 'n0', 10);
  });

  bench('shortest path', () => {
    new GraphTraversal().shortestPath(nodes, edges, 'n0', 'n99');
  });
});

describe('CycleDetection benchmarks', () => {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < 100; i++) {
    edges.push({ source: `n${i}`, target: `n${(i + 1) % 100}`, type: 'dep', label: '', weight: 1 });
  }

  bench('detect cycle', () => {
    new CycleDetection().detect(edges);
  });
});

describe('DependencyGraph benchmarks', () => {
  bench('topological levels', () => {
    const graph = new DependencyGraph();
    graph.addDependency('composition', 'narrative');
    graph.addDependency('narrative', 'character');
    graph.addDependency('character', 'kernel');
    graph.getTopologicalLevels();
  });
});
