import { bench, describe } from 'vitest';
import { ExecutionGraph } from '../src/execution-graph';
import { ExecutionScheduler } from '../src/execution-scheduler';
import { ExecutionMemory } from '../src/execution-memory';
import type { ExecutionContext } from '../src/execution-context';
import type { AgentInput, AgentOutput } from '../src/agents/execution-agent';

class FastMockAgent {
  constructor(
    public id: string,
    public name: string,
    public dependencies: string[] = [],
  ) {}
  async execute(input: AgentInput): Promise<AgentOutput> {
    return {
      agentId: this.id,
      success: true,
      content: 'Output',
      tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      latencyMs: 1,
    };
  }
}

function makeContext(): ExecutionContext {
  return {
    sessionId: 'bench',
    planningResult: {} as any,
    aiRuntime: {} as any,
    options: { model: 'gpt-4', maxRetries: 1, timeout: 5000 },
  };
}

describe('Parallel Execution Benchmarks', () => {
  bench('execute 16 parallel tasks', async () => {
    const graph = new ExecutionGraph();
    for (let i = 0; i < 16; i++) {
      graph.addTask({
        id: `t${i}`, name: `Task ${i}`, agent: new FastMockAgent(`a${i}`, `Agent ${i}`) as any,
        priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'pending',
      });
    }
    const scheduler = new ExecutionScheduler();
    await scheduler.execute(graph, makeContext(), new ExecutionMemory(), {
      mode: 'parallel', retryDelay: 10,
    });
  });

  bench('execute 4-layer diamond graph (11 tasks)', async () => {
    const graph = new ExecutionGraph();
    for (let i = 0; i < 4; i++) {
      graph.addTask({
        id: `l1-${i}`, name: `Layer1-${i}`, agent: new FastMockAgent(`a1-${i}`, `A1-${i}`) as any,
        priority: 1, dependencies: [], maxRetries: 1, timeout: 5000, status: 'pending',
      });
    }
    for (let i = 0; i < 3; i++) {
      graph.addTask({
        id: `l2-${i}`, name: `Layer2-${i}`, agent: new FastMockAgent(`a2-${i}`, `A2-${i}`) as any,
        priority: 1, dependencies: Array.from({ length: 4 }, (_, j) => `l1-${j}`), maxRetries: 1, timeout: 5000, status: 'pending',
      });
    }
    graph.addTask({
      id: 'l3', name: 'Layer3', agent: new FastMockAgent('a3', 'A3') as any,
      priority: 1, dependencies: ['l2-0', 'l2-1', 'l2-2'], maxRetries: 1, timeout: 5000, status: 'pending',
    });
    const scheduler = new ExecutionScheduler();
    await scheduler.execute(graph, makeContext(), new ExecutionMemory(), {
      mode: 'parallel', retryDelay: 10,
    });
  });
});
