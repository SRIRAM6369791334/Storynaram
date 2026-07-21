import { describe, it, expect } from 'vitest';
import { ExecutionQueue } from '../src/execution-queue';
import type { ExecutionTask } from '../src/execution-graph';
import type { ExecutionAgent } from '../src/agents/execution-agent';

class FakeAgent implements ExecutionAgent {
  constructor(
    public id: string,
    public name: string,
    public dependencies: string[] = [],
  ) {}
  async execute(): Promise<any> { return { agentId: this.id, success: true, content: '', tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, latencyMs: 0 }; }
}

function makeTask(overrides: Partial<ExecutionTask> = {}): ExecutionTask {
  return {
    id: 'task-1',
    name: 'Default Task',
    agent: new FakeAgent('a1', 'Agent 1'),
    priority: 1,
    dependencies: [],
    maxRetries: 3,
    timeout: 60000,
    status: 'pending',
    ...overrides,
  };
}

describe('ExecutionQueue', () => {
  it('enqueues and dequeues tasks', () => {
    const queue = new ExecutionQueue();
    const task = makeTask();
    queue.enqueue(task);
    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(task);
    expect(queue.isEmpty()).toBe(true);
  });

  it('orders by priority descending', () => {
    const queue = new ExecutionQueue();
    const low = makeTask({ id: 'low', priority: 1 });
    const high = makeTask({ id: 'high', priority: 10 });
    queue.enqueue(low);
    queue.enqueue(high);
    expect(queue.dequeue()!.id).toBe('high');
    expect(queue.dequeue()!.id).toBe('low');
  });

  it('supports batch enqueue', () => {
    const queue = new ExecutionQueue();
    const tasks = [makeTask({ id: 't1' }), makeTask({ id: 't2' })];
    queue.enqueueBatch(tasks);
    expect(queue.size).toBe(2);
  });

  it('peeks without removing', () => {
    const queue = new ExecutionQueue();
    const task = makeTask({ id: 'peek-task', priority: 5 });
    queue.enqueue(task);
    expect(queue.peek()).toBe(task);
    expect(queue.size).toBe(1);
  });

  it('removes a task by id', () => {
    const queue = new ExecutionQueue();
    queue.enqueue(makeTask({ id: 'remove-me' }));
    expect(queue.remove('remove-me')).toBe(true);
    expect(queue.isEmpty()).toBe(true);
  });

  it('returns false when removing nonexistent task', () => {
    const queue = new ExecutionQueue();
    expect(queue.remove('nonexistent')).toBe(false);
  });

  it('clears all tasks', () => {
    const queue = new ExecutionQueue();
    queue.enqueue(makeTask({ id: 't1' }));
    queue.enqueue(makeTask({ id: 't2' }));
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
  });

  it('gets all tasks', () => {
    const queue = new ExecutionQueue();
    const task = makeTask();
    queue.enqueue(task);
    expect(queue.getAll()).toEqual([task]);
  });
});
