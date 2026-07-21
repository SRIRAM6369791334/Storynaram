import { describe, it, expect } from 'vitest';
import { ExecutionMemory } from '../src/execution-memory';
import type { AgentOutput } from '../src/agents/execution-agent';

describe('ExecutionMemory', () => {
  const sampleOutput: AgentOutput = {
    agentId: 'agent-1',
    success: true,
    content: 'Generated content',
    tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    latencyMs: 100,
  };

  it('records and retrieves outputs', () => {
    const memory = new ExecutionMemory();
    memory.record({
      agentId: 'agent-1',
      stage: 'character',
      output: sampleOutput,
      timestamp: new Date(),
      durationMs: 100,
    });

    const retrieved = memory.getOutput('agent-1');
    expect(retrieved).toBe(sampleOutput);
  });

  it('returns undefined for missing agent output', () => {
    const memory = new ExecutionMemory();
    expect(memory.getOutput('nonexistent')).toBeUndefined();
  });

  it('retrieves all outputs', () => {
    const memory = new ExecutionMemory();
    memory.record({ agentId: 'a1', stage: 's1', output: sampleOutput, timestamp: new Date(), durationMs: 100 });
    memory.record({ agentId: 'a2', stage: 's2', output: { ...sampleOutput, agentId: 'a2' }, timestamp: new Date(), durationMs: 200 });

    expect(memory.getAllOutputs()).toHaveLength(2);
    expect(memory.getSuccessfulOutputs()).toHaveLength(2);
  });

  it('filters successful outputs', () => {
    const memory = new ExecutionMemory();
    memory.record({ agentId: 'a1', stage: 's1', output: sampleOutput, timestamp: new Date(), durationMs: 100 });
    memory.record({ agentId: 'a2', stage: 's2', output: { ...sampleOutput, agentId: 'a2', success: false }, timestamp: new Date(), durationMs: 200 });

    expect(memory.getSuccessfulOutputs()).toHaveLength(1);
    expect(memory.getSuccessfulOutputs()[0]!.agentId).toBe('agent-1');
  });

  it('manages shared context', () => {
    const memory = new ExecutionMemory();
    memory.setShared('key1', 'value1');
    memory.setShared('key2', 42);

    expect(memory.getShared('key1')).toBe('value1');
    expect(memory.getShared<number>('key2')).toBe(42);
    expect(memory.getShared('nonexistent')).toBeUndefined();
  });

  it('manages retry state', () => {
    const memory = new ExecutionMemory();
    const state = { agentId: 'a1', attempt: 2, maxRetries: 3, lastError: 'timeout' };

    memory.setRetryState('a1', state);
    expect(memory.getRetryState('a1')).toEqual(state);

    memory.clearRetryState('a1');
    expect(memory.getRetryState('a1')).toBeUndefined();
  });

  it('snapshots and restores state', () => {
    const memory = new ExecutionMemory();
    memory.record({ agentId: 'a1', stage: 's1', output: sampleOutput, timestamp: new Date(), durationMs: 100 });
    memory.setShared('key', 'value');

    const snapshot = memory.snapshot();
    const newMemory = new ExecutionMemory();
    newMemory.restore(snapshot);

    expect(newMemory.getOutput('a1')).toEqual(sampleOutput);
    expect(newMemory.getShared('key')).toBe('value');
    expect(newMemory.getHistory()).toHaveLength(1);
  });

  it('records execution history', () => {
    const memory = new ExecutionMemory();
    memory.record({ agentId: 'a1', stage: 's1', output: sampleOutput, timestamp: new Date(), durationMs: 100 });

    const history = memory.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]!.agentId).toBe('a1');
    expect(history[0]!.stage).toBe('s1');
    expect(history[0]!.durationMs).toBe(100);
  });
});
