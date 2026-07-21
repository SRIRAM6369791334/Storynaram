import { describe, it, expect } from 'vitest';
import { ExecutionGraph } from '../src/execution-graph';
import type { ExecutionAgent } from '../src/agents/execution-agent';

class FakeAgent implements ExecutionAgent {
  constructor(
    public id: string,
    public name: string,
    public dependencies: string[] = [],
  ) {}
  async execute(): Promise<any> { return { agentId: this.id, success: true, content: '', tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, latencyMs: 0 }; }
}

describe('ExecutionGraph', () => {
  it('adds and retrieves tasks', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    expect(graph.totalTasks).toBe(1);
    expect(graph.getTask('t1')).toBeDefined();
    expect(graph.getTask('nonexistent')).toBeUndefined();
  });

  it('detects ready tasks', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    const statuses = new Map<string, any>();
    statuses.set('t1', 'pending');

    const ready = graph.getReadyTasks(statuses);
    expect(ready).toHaveLength(1);
    expect(ready[0]!.id).toBe('t1');
  });

  it('does not return tasks with unmet dependencies as ready', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'completed',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: ['t1'], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    const statuses = new Map<string, any>();
    statuses.set('t1', 'completed');
    statuses.set('t2', 'pending');

    const ready = graph.getReadyTasks(statuses);
    expect(ready).toHaveLength(1);
    expect(ready[0]!.id).toBe('t2');
  });

  it('detects cycles', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: ['t2'], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: ['t3'], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't3', name: 'Task 3', agent: new FakeAgent('a3', 'Agent 3'),
      priority: 1, dependencies: ['t1'], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    expect(graph.hasCycles()).toBe(true);
  });

  it('reports no cycles for acyclic graph', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: ['t1'], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    expect(graph.hasCycles()).toBe(false);
  });

  it('computes topological layers', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't3', name: 'Task 3', agent: new FakeAgent('a3', 'Agent 3'),
      priority: 1, dependencies: ['t1', 't2'], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't4', name: 'Task 4', agent: new FakeAgent('a4', 'Agent 4'),
      priority: 1, dependencies: ['t3'], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    const layers = graph.getTopologicalLayers();
    expect(layers).toHaveLength(3);
    expect(layers[0]!.map(t => t.id).sort()).toEqual(['t1', 't2']);
    expect(layers[1]!.map(t => t.id)).toEqual(['t3']);
    expect(layers[2]!.map(t => t.id)).toEqual(['t4']);
  });

  it('finds dependents of a task', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: ['t1'], maxRetries: 3, timeout: 60000, status: 'pending',
    });
    graph.addTask({
      id: 't3', name: 'Task 3', agent: new FakeAgent('a3', 'Agent 3'),
      priority: 1, dependencies: ['t1'], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    const deps = graph.getDependents('t1');
    expect(deps).toHaveLength(2);
    expect(deps.map(d => d.id).sort()).toEqual(['t2', 't3']);
  });

  it('resets all tasks to pending', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'completed',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: ['t1'], maxRetries: 3, timeout: 60000, status: 'failed',
    });

    graph.reset();
    expect(Array.from(graph.tasks.values()).every(t => t.status === 'pending')).toBe(true);
    expect(Array.from(graph.tasks.values()).every(t => t.output === undefined)).toBe(true);
  });

  it('computes completed and failed counts', () => {
    const graph = new ExecutionGraph();
    graph.addTask({
      id: 't1', name: 'Task 1', agent: new FakeAgent('a1', 'Agent 1'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'completed',
    });
    graph.addTask({
      id: 't2', name: 'Task 2', agent: new FakeAgent('a2', 'Agent 2'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'failed',
    });
    graph.addTask({
      id: 't3', name: 'Task 3', agent: new FakeAgent('a3', 'Agent 3'),
      priority: 1, dependencies: [], maxRetries: 3, timeout: 60000, status: 'pending',
    });

    expect(graph.completedCount).toBe(1);
    expect(graph.failedCount).toBe(1);
  });
});
