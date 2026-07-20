import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowCheckpointService, WorkflowHistoryService, WorkflowContext } from '../src/workflow';

describe('WorkflowCheckpointService', () => {
  let history: WorkflowHistoryService;
  let context: WorkflowContext;
  let checkpoint: WorkflowCheckpointService;

  beforeEach(() => {
    history = new WorkflowHistoryService();
    context = new WorkflowContext();
    checkpoint = new WorkflowCheckpointService(history, context, { enabled: true });
  });

  it('should save and restore checkpoints', async () => {
    await checkpoint.save('wf-1', 'step-3', { data: 'test', count: 42 });
    const restored = await checkpoint.restore('wf-1');

    expect(restored).not.toBeNull();
    expect(restored!.workflowId).toBe('wf-1');
    expect(restored!.stepId).toBe('step-3');
    expect(restored!.context).toEqual({ data: 'test', count: 42 });
  });

  it('should restore context into WorkflowContext', async () => {
    await checkpoint.save('wf-2', 'step-1', { key: 'value', num: 100 });
    await checkpoint.restore('wf-2');

    expect(context.get('wf-2', 'key')).toBe('value');
    expect(context.get('wf-2', 'num')).toBe(100);
  });

  it('should return null for missing checkpoint', async () => {
    const restored = await checkpoint.restore('nonexistent');
    expect(restored).toBeNull();
  });

  it('should check checkpoint existence', async () => {
    expect(await checkpoint.hasCheckpoint('wf-3')).toBe(false);
    await checkpoint.save('wf-3', 'step-1', {});
    expect(await checkpoint.hasCheckpoint('wf-3')).toBe(true);
  });

  it('should clear checkpoints', async () => {
    await checkpoint.save('wf-4', 'step-1', {});
    await checkpoint.clear('wf-4');
    expect(await checkpoint.hasCheckpoint('wf-4')).toBe(false);
  });

  it('should not save checkpoints when disabled', async () => {
    const disabledCheckpoint = new WorkflowCheckpointService(history, context, { enabled: false });
    await disabledCheckpoint.save('wf-5', 'step-1', { data: 'test' });
    const restored = await disabledCheckpoint.restore('wf-5');
    expect(restored).toBeNull();
  });

  it('should preserve timestamp in checkpoint', async () => {
    const before = Date.now();
    await checkpoint.save('wf-6', 'step-2', {});
    const after = Date.now();
    const restored = await checkpoint.restore('wf-6');

    expect(restored!.timestamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(restored!.timestamp.getTime()).toBeLessThanOrEqual(after);
  });

  it('should store version metadata', async () => {
    await checkpoint.save('wf-7', 'step-1', {});
    const restored = await checkpoint.restore('wf-7');
    expect(restored!.version).toBe('1.0');
  });
});

describe('WorkflowHistoryService', () => {
  let history: WorkflowHistoryService;

  beforeEach(() => {
    history = new WorkflowHistoryService();
  });

  it('should record and retrieve history entries', async () => {
    const entry = {
      id: 'h1',
      workflowId: 'wf-1',
      stepId: 'step1',
      eventType: 'WorkflowStepStarted' as const,
      status: 'Running',
      data: {},
      timestamp: new Date(),
      durationMs: null,
    };

    await history.record(entry);
    const entries = await history.getHistory('wf-1');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.id).toBe('h1');
  });

  it('should filter step history', async () => {
    await history.record({ id: 'h1', workflowId: 'wf-1', stepId: 's1', eventType: 'WorkflowStepStarted', status: 'Running', data: {}, timestamp: new Date(), durationMs: null });
    await history.record({ id: 'h2', workflowId: 'wf-1', stepId: 's2', eventType: 'WorkflowStepStarted', status: 'Running', data: {}, timestamp: new Date(), durationMs: null });
    await history.record({ id: 'h3', workflowId: 'wf-1', stepId: 's1', eventType: 'WorkflowStepCompleted', status: 'Completed', data: {}, timestamp: new Date(), durationMs: 100 });

    const s1entries = await history.getStepHistory('wf-1', 's1');
    expect(s1entries).toHaveLength(2);
  });

  it('should limit entries per workflow', async () => {
    history.setMaxEntries(3);
    for (let i = 0; i < 5; i++) {
      await history.record({ id: `h${i}`, workflowId: 'wf-1', stepId: null, eventType: 'WorkflowStarted', status: 'Ready', data: {}, timestamp: new Date(), durationMs: null });
    }
    const entries = await history.getHistory('wf-1');
    expect(entries.length).toBeLessThanOrEqual(3);
  });

  it('should delete history', async () => {
    await history.record({ id: 'h1', workflowId: 'wf-1', stepId: null, eventType: 'WorkflowStarted', status: 'Ready', data: {}, timestamp: new Date(), durationMs: null });
    await history.deleteHistory('wf-1');
    const entries = await history.getHistory('wf-1');
    expect(entries).toHaveLength(0);
  });

  it('should clear all data', async () => {
    await history.record({ id: 'h1', workflowId: 'wf-1', stepId: null, eventType: 'WorkflowStarted', status: 'Ready', data: {}, timestamp: new Date(), durationMs: null });
    await history.record({ id: 'h2', workflowId: 'wf-2', stepId: null, eventType: 'WorkflowStarted', status: 'Ready', data: {}, timestamp: new Date(), durationMs: null });
    await history.clear();
    expect(history.getHistoryCount()).toBe(0);
  });

  it('should return total entry count', async () => {
    await history.record({ id: 'h1', workflowId: 'wf-1', stepId: null, eventType: 'WorkflowStarted', status: 'Ready', data: {}, timestamp: new Date(), durationMs: null });
    await history.record({ id: 'h2', workflowId: 'wf-1', stepId: null, eventType: 'WorkflowStarted', status: 'Ready', data: {}, timestamp: new Date(), durationMs: null });
    expect(history.getHistoryCount()).toBe(2);
  });
});
