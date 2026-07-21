import { bench, describe } from 'vitest';
import { ExecutionGraph } from '../src/execution-graph';
import { ExecutionQueue } from '../src/execution-queue';

class NoopAgent {
  id = 'noop';
  name = 'Noop';
  dependencies: string[] = [];
  async execute() {
    return { agentId: 'noop', success: true, content: '', tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, latencyMs: 0 };
  }
}

function buildLargeGraph(size: number): ExecutionGraph {
  const graph = new ExecutionGraph();
  for (let i = 0; i < size; i++) {
    const deps = i > 0 ? [`task-${i - 1}`] : [];
    graph.addTask({
      id: `task-${i}`,
      name: `Task ${i}`,
      agent: new NoopAgent() as any,
      priority: 1,
      dependencies: deps,
      maxRetries: 3,
      timeout: 60000,
      status: 'pending',
    });
  }
  return graph;
}

describe('ExecutionGraph Scheduling Benchmarks', () => {
  bench('topological layers on 100-task graph', () => {
    const graph = buildLargeGraph(100);
    graph.getTopologicalLayers();
  });

  bench('topological layers on 500-task graph', () => {
    const graph = buildLargeGraph(500);
    graph.getTopologicalLayers();
  });

  bench('cycle detection on 100-task graph', () => {
    const graph = buildLargeGraph(100);
    graph.hasCycles();
  });

  bench('ready task detection with 1000 tasks', () => {
    const graph = buildLargeGraph(1000);
    const statuses = new Map<string, any>();
    for (let i = 0; i < 1000; i++) {
      statuses.set(`task-${i}`, i === 0 ? 'pending' : 'pending');
    }
    graph.getReadyTasks(statuses);
  });
});

describe('ExecutionQueue Benchmarks', () => {
  bench('enqueue 10000 tasks', () => {
    const queue = new ExecutionQueue();
    for (let i = 0; i < 10000; i++) {
      queue.enqueue({ id: `t-${i}`, name: `Task ${i}`, agent: new NoopAgent() as any, priority: i % 10, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending' });
    }
  });

  bench('dequeue 10000 tasks', () => {
    const queue = new ExecutionQueue();
    for (let i = 0; i < 10000; i++) {
      queue.enqueue({ id: `t-${i}`, name: `Task ${i}`, agent: new NoopAgent() as any, priority: i % 10, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending' });
    }
    while (!queue.isEmpty()) {
      queue.dequeue();
    }
  });
});
