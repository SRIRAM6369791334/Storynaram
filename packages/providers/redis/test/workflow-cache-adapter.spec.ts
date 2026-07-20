import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { WorkflowCacheAdapter } from '../src/storage/workflow-cache-adapter';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('WorkflowCacheAdapter', () => {
  let connection: RedisConnection;
  let adapter: WorkflowCacheAdapter;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    adapter = new WorkflowCacheAdapter(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  const makeInstance = (overrides: Record<string, unknown> = {}) => ({
    id: 'wf-1',
    workflowName: 'test-workflow',
    version: '1.0',
    status: 'running' as const,
    currentStepId: 'step-1',
    context: { foo: 'bar' },
    history: [],
    startedAt: new Date(),
    completedAt: null,
    updatedAt: new Date(),
    error: null,
    retryCount: 0,
    checkpoint: null,
    ...overrides,
  });

  it('saves and retrieves an instance', async () => {
    const instance = makeInstance();
    await adapter.saveInstance(instance);
    const retrieved = await adapter.getInstance('wf-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('wf-1');
    expect(retrieved?.workflowName).toBe('test-workflow');
    expect(retrieved?.status).toBe('running');
  });

  it('getInstance returns undefined for missing', async () => {
    const result = await adapter.getInstance('nonexistent');
    expect(result).toBeUndefined();
  });

  it('findInstances returns matching instances', async () => {
    await adapter.saveInstance(makeInstance({ id: 'wf-a', workflowName: 'wf-type-a' }));
    await adapter.saveInstance(makeInstance({ id: 'wf-b', workflowName: 'wf-type-b' }));
    const found = await adapter.findInstances({});
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it('saves and retrieves history', async () => {
    const historyEntry = {
      id: 'hist-1',
      workflowId: 'wf-1',
      stepId: 'step-1',
      eventType: 'step_started' as const,
      status: 'running',
      data: { input: 'test' },
      timestamp: new Date(),
      durationMs: null,
    };
    await adapter.saveHistory(historyEntry);
    const history = await adapter.getHistory('wf-1');
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0]?.eventType).toBe('step_started');
  });

  it('saves and retrieves checkpoints', async () => {
    const checkpoint = {
      workflowId: 'wf-1',
      stepId: 'step-2',
      context: { saved: true },
      timestamp: new Date(),
      version: '1',
    };
    await adapter.saveCheckpoint(checkpoint);
    const retrieved = await adapter.getCheckpoint('wf-1', 'step-2');
    expect(retrieved).toBeDefined();
    expect(retrieved?.context.saved).toBe(true);
  });

  it('deletes checkpoints', async () => {
    await adapter.saveCheckpoint({ workflowId: 'wf-del', stepId: 's1', context: {}, timestamp: new Date(), version: '1' });
    await adapter.deleteCheckpoint('wf-del', 's1');
    const result = await adapter.getCheckpoint('wf-del', 's1');
    expect(result).toBeUndefined();
  });

  it('deletes an instance', async () => {
    await adapter.saveInstance(makeInstance({ id: 'wf-del' }));
    await adapter.deleteInstance('wf-del');
    const result = await adapter.getInstance('wf-del');
    expect(result).toBeUndefined();
  });

  it('getInstanceCount returns number of instances', async () => {
    await adapter.saveInstance(makeInstance({ id: 'wf-c1' }));
    await adapter.saveInstance(makeInstance({ id: 'wf-c2' }));
    const count = await adapter.getInstanceCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
