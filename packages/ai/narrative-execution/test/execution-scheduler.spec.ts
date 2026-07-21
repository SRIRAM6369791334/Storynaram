import { describe, it, expect, vi } from 'vitest';
import { ExecutionGraph } from '../src/execution-graph';
import { ExecutionScheduler } from '../src/execution-scheduler';
import type { ExecutionAgent, AgentInput, AgentOutput } from '../src/agents/execution-agent';
import type { ExecutionContext } from '../src/execution-context';
import { ExecutionMemory } from '../src/execution-memory';

class MockAgent implements ExecutionAgent {
  public callCount = 0;
  public shouldFail = false;
  public delay = 0;

  constructor(
    public id: string,
    public name: string,
    public dependencies: string[] = [],
  ) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    this.callCount++;
    if (this.delay > 0) {
      await new Promise(r => setTimeout(r, this.delay));
    }
    if (this.shouldFail) {
      throw new Error(`Agent ${this.id} failed`);
    }
    return {
      agentId: this.id,
      success: true,
      content: `Output from ${this.id}`,
      tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      latencyMs: 10,
    };
  }
}

function makeContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    sessionId: 'test-session',
    planningResult: {} as any,
    aiRuntime: {} as any,
    options: { model: 'gpt-4', maxRetries: 1, timeout: 5000, parallel: true, ...overrides.options },
    abortSignal: overrides.abortSignal,
    ...overrides,
  };
}

describe('ExecutionScheduler', () => {
  it('executes tasks sequentially', async () => {
    const graph = new ExecutionGraph();
    const agent1 = new MockAgent('a1', 'Agent 1');
    const agent2 = new MockAgent('a2', 'Agent 2', ['a1']);

    graph.addTask({ id: 'a1', name: 'Task 1', agent: agent1, priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'pending' });
    graph.addTask({ id: 'a2', name: 'Task 2', agent: agent2, priority: 1, dependencies: ['a1'], maxRetries: 1, timeout: 5000, status: 'pending' });

    const scheduler = new ExecutionScheduler();
    const result = await scheduler.execute(graph, makeContext(), new ExecutionMemory(), { mode: 'sequential' });

    expect(result.success).toBe(true);
    expect(result.completedTaskIds).toContain('a1');
    expect(result.completedTaskIds).toContain('a2');
    expect(agent1.callCount).toBe(1);
    expect(agent2.callCount).toBe(1);
  });

  it('executes tasks in parallel layers', async () => {
    const graph = new ExecutionGraph();
    const agent1 = new MockAgent('a1', 'Agent 1');
    const agent2 = new MockAgent('a2', 'Agent 2');
    const agent3 = new MockAgent('a3', 'Agent 3', ['a1', 'a2']);

    graph.addTask({ id: 'a1', name: 'Task 1', agent: agent1, priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'pending' });
    graph.addTask({ id: 'a2', name: 'Task 2', agent: agent2, priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'pending' });
    graph.addTask({ id: 'a3', name: 'Task 3', agent: agent3, priority: 1, dependencies: ['a1', 'a2'], maxRetries: 1, timeout: 5000, status: 'pending' });

    const scheduler = new ExecutionScheduler();
    const result = await scheduler.execute(graph, makeContext(), new ExecutionMemory(), { mode: 'parallel' });

    expect(result.success).toBe(true);
    expect(result.completedTaskIds).toHaveLength(3);
  });

  it('retries failed tasks', async () => {
    const graph = new ExecutionGraph();
    const agent = new MockAgent('a1', 'Agent 1');
    agent.shouldFail = true;

    graph.addTask({ id: 'a1', name: 'Task 1', agent, priority: 1, dependencies: [], maxRetries: 2, timeout: 5000, status: 'pending' });

    const scheduler = new ExecutionScheduler();
    const result = await scheduler.execute(graph, makeContext(), new ExecutionMemory(), { mode: 'sequential', retryDelay: 10 });

    expect(result.success).toBe(false);
    expect(result.failedTaskIds).toContain('a1');
    expect(agent.callCount).toBe(2);
  });

  it('handles task timeouts', async () => {
    const graph = new ExecutionGraph();
    const agent = new MockAgent('a1', 'Agent 1');
    agent.delay = 200;

    graph.addTask({ id: 'a1', name: 'Task 1', agent, priority: 1, dependencies: [], maxRetries: 1, timeout: 50, status: 'pending' });

    const scheduler = new ExecutionScheduler();
    const result = await scheduler.execute(graph, makeContext(), new ExecutionMemory(), { mode: 'sequential', retryDelay: 10 });

    expect(result.success).toBe(false);
    expect(result.failedTaskIds).toContain('a1');
  });

  it('supports cancellation via AbortSignal', async () => {
    const graph = new ExecutionGraph();
    const agent1 = new MockAgent('a1', 'Agent 1');
    const agent2 = new MockAgent('a2', 'Agent 2', ['a1']);

    agent1.delay = 1000;

    graph.addTask({ id: 'a1', name: 'Task 1', agent: agent1, priority: 1, dependencies: [], maxRetries: 1, timeout: 50000, status: 'pending' });
    graph.addTask({ id: 'a2', name: 'Task 2', agent: agent2, priority: 1, dependencies: ['a1'], maxRetries: 1, timeout: 50000, status: 'pending' });

    const controller = new AbortController();
    const context = makeContext({ abortSignal: controller.signal });
    const scheduler = new ExecutionScheduler();

    setTimeout(() => controller.abort(), 50);
    const result = await scheduler.execute(graph, context, new ExecutionMemory(), { mode: 'parallel' });

    expect(result.completedTaskIds).not.toContain('a2');
  });

  it('rejects cycles', async () => {
    const graph = new ExecutionGraph();
    graph.addTask({ id: 'a1', name: 'Task 1', agent: new MockAgent('a1', 'Agent 1', ['a2']), priority: 1, dependencies: ['a2'], maxRetries: 1, timeout: 5000, status: 'pending' });
    graph.addTask({ id: 'a2', name: 'Task 2', agent: new MockAgent('a2', 'Agent 2', ['a1']), priority: 1, dependencies: ['a1'], maxRetries: 1, timeout: 5000, status: 'pending' });

    const scheduler = new ExecutionScheduler();
    await expect(scheduler.execute(graph, makeContext(), new ExecutionMemory())).rejects.toThrow('contains cycles');
  });

  it('resumes from completed tasks', async () => {
    const graph = new ExecutionGraph();
    const agent1 = new MockAgent('a1', 'Agent 1');
    const agent2 = new MockAgent('a2', 'Agent 2', ['a1']);

    graph.addTask({ id: 'a1', name: 'Task 1', agent: agent1, priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'completed' });
    graph.addTask({ id: 'a2', name: 'Task 2', agent: agent2, priority: 1, dependencies: ['a1'], maxRetries: 1, timeout: 5000, status: 'pending' });

    const memory = new ExecutionMemory();
    memory.record({ agentId: 'a1', stage: 'Task 1', output: { agentId: 'a1', success: true, content: 'done', tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, latencyMs: 0 }, timestamp: new Date(), durationMs: 0 });

    const scheduler = new ExecutionScheduler();
    const result = await scheduler.resume(graph, makeContext(), memory, ['a1']);

    expect(result.success).toBe(true);
    expect(result.completedTaskIds).toContain('a2');
    expect(agent1.callCount).toBe(0);
  });

  it('collects task results', async () => {
    const graph = new ExecutionGraph();
    const agent = new MockAgent('a1', 'Agent 1');

    graph.addTask({ id: 'a1', name: 'Task 1', agent, priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'pending' });

    const scheduler = new ExecutionScheduler();
    const result = await scheduler.execute(graph, makeContext(), new ExecutionMemory(), { mode: 'sequential' });

    const output = result.taskResults.get('a1');
    expect(output).toBeDefined();
    expect(output!.content).toBe('Output from a1');
  });
});
