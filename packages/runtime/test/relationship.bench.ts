import { describe, it, expect } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipTraversalService } from '../src/relationship/relationship-traversal.service';

function id(value: string): EntityId {
  return value as EntityId;
}

function measure(fn: () => void | Promise<void>): number {
  const start = performance.now();
  const result = fn();
  if (result instanceof Promise) {
    throw new Error('Sync measurement only');
  }
  return performance.now() - start;
}

async function measureAsync(fn: () => Promise<void>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

describe('Relationship benchmarks', () => {
  const SMALL = 10000;
  const LARGE = 100000;

  it('benchmark: add 10,000 edges', () => {
    const graph = new RelationshipGraph();
    const elapsed = measure(() => {
      for (let i = 0; i < SMALL; i++) {
        graph.addNode({ entityId: id(`n${String(i)}`), entityType: 'node' });
      }
      for (let i = 0; i < SMALL; i++) {
        graph.addEdge(id(`n${String(i)}`), id(`n${String((i + 1) % SMALL)}`), 'directed');
      }
    });
    console.log(`Add ${String(SMALL)} edges: ${elapsed.toFixed(2)}ms`);
    expect(graph.edgesSize).toBe(SMALL);
  });

  it('benchmark: add 100,000 edges', () => {
    const graph = new RelationshipGraph();
    const elapsed = measure(() => {
      for (let i = 0; i < LARGE; i++) {
        graph.addNode({ entityId: id(`n${String(i)}`), entityType: 'node' });
      }
      for (let i = 0; i < LARGE; i++) {
        graph.addEdge(id(`n${String(i)}`), id(`n${String((i + 1) % LARGE)}`), 'directed');
      }
    });
    console.log(`Add ${String(LARGE)} edges: ${elapsed.toFixed(2)}ms`);
    expect(graph.edgesSize).toBe(LARGE);
  });

  it('benchmark: path lookup', () => {
    const graph = new RelationshipGraph();
    const chainLength = 1000;
    for (let i = 0; i < chainLength; i++) {
      graph.addEdge(id(`n${String(i)}`), id(`n${String(i + 1)}`), 'directed');
    }
    const traversal = new RelationshipTraversalService(graph);
    const elapsed = measure(() => {
      const result = traversal.path(id('n0'), id(`n${String(chainLength - 1)}`));
      expect(result).toBeDefined();
    });
    console.log(`Path lookup (${String(chainLength)} chain): ${elapsed.toFixed(2)}ms`);
  });

  it('benchmark: shortest path in dense graph', () => {
    const graph = new RelationshipGraph();
    const size = 500;
    for (let i = 0; i < size; i++) {
      graph.addNode({ entityId: id(`n${String(i)}`), entityType: 'node' });
    }
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < Math.min(i + 10, size); j++) {
        graph.addEdge(id(`n${String(i)}`), id(`n${String(j)}`), 'directed');
      }
    }
    const traversal = new RelationshipTraversalService(graph);
    const elapsed = measure(() => {
      const result = traversal.shortestPath(id('n0'), id(`n${String(size - 1)}`));
      expect(result).toBeDefined();
    });
    console.log(`Shortest path (${String(size)} nodes, dense): ${elapsed.toFixed(2)}ms`);
  });

  it('benchmark: BFS traversal', () => {
    const graph = new RelationshipGraph();
    const size = 5000;
    for (let i = 0; i < size; i++) {
      graph.addEdge(id(`n${String(i)}`), id(`n${String((i + 1) % size)}`), 'directed');
    }
    const traversal = new RelationshipTraversalService(graph);
    let count = 0;
    const elapsed = measure(() => {
      traversal.bfs(id('n0'), () => { count++; });
    });
    console.log(`BFS traversal (${String(size)} nodes): ${elapsed.toFixed(2)}ms (${String(count)} visited)`);
  });

  it('benchmark: graph updates (delete + re-add)', () => {
    const graph = new RelationshipGraph();
    const size = 10000;
    for (let i = 0; i < size; i++) {
      graph.addEdge(id(`n${String(i)}`), id(`n${String((i + 1) % size)}`), 'directed');
    }
    const elapsed = measure(() => {
      for (let i = 0; i < 1000; i++) {
        graph.removeEdgeByEndpoints(id(`n${String(i)}`), id(`n${String((i + 1) % size)}`));
        graph.addEdge(id(`n${String(i)}`), id(`n${String((i + 1) % size)}`), 'directed');
      }
    });
    console.log(`Graph updates (1,000 delete+add): ${elapsed.toFixed(2)}ms`);
  });

  it('benchmark: cycle detection', () => {
    const graph = new RelationshipGraph();
    const size = 2000;
    for (let i = 0; i < size; i++) {
      graph.addEdge(id(`n${String(i)}`), id(`n${String((i + 1) % size)}`), 'directed');
    }
    const traversal = new RelationshipTraversalService(graph);
    const elapsed = measure(() => {
      const result = traversal.detectCycles();
      expect(result.hasCycles).toBe(true);
    });
    console.log(`Cycle detection (${String(size)} nodes): ${elapsed.toFixed(2)}ms`);
  });
});
