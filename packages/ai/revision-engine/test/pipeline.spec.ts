import { describe, it, expect } from 'vitest';
import { RevisionPipeline } from '../src/types/revision-pipeline';

describe('RevisionPipeline', () => {
  it('starts with empty state', () => {
    const pipeline = new RevisionPipeline();
    expect(pipeline.state.stages).toHaveLength(0);
    expect(pipeline.state.currentPassIndex).toBe(0);
    expect(pipeline.state.totalIssuesFound).toBe(0);
    expect(pipeline.state.totalIssuesResolved).toBe(0);
  });

  it('adds stages', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('grammar-check', 'grammar');
    pipeline.addStage('character-check', 'character');

    expect(pipeline.state.stages).toHaveLength(2);
    expect(pipeline.state.stages[0]!.name).toBe('grammar-check');
    expect(pipeline.state.stages[0]!.passType).toBe('grammar');
    expect(pipeline.state.stages[0]!.status).toBe('pending');
  });

  it('starts and completes stages', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('grammar', 'grammar');

    pipeline.startStage('grammar');
    expect(pipeline.state.stages[0]!.status).toBe('running');
    expect(pipeline.state.stages[0]!.startedAt).toBeDefined();

    pipeline.completeStage('grammar', 5, 3);
    expect(pipeline.state.stages[0]!.status).toBe('completed');
    expect(pipeline.state.stages[0]!.issuesFound).toBe(5);
    expect(pipeline.state.stages[0]!.issuesResolved).toBe(3);
    expect(pipeline.state.totalIssuesFound).toBe(5);
    expect(pipeline.state.totalIssuesResolved).toBe(3);
  });

  it('fails stages', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('test', 'grammar');

    pipeline.failStage('test', 'Unexpected error');
    expect(pipeline.state.stages[0]!.status).toBe('failed');
    expect(pipeline.state.stages[0]!.error).toBe('Unexpected error');
  });

  it('checks completeness', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('a', 'grammar');
    pipeline.addStage('b', 'character');

    expect(pipeline.isComplete()).toBe(false);

    pipeline.startStage('a');
    pipeline.completeStage('a', 0, 0);
    pipeline.startStage('b');
    pipeline.completeStage('b', 0, 0);

    expect(pipeline.isComplete()).toBe(true);
  });

  it('detects failure', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('a', 'grammar');
    pipeline.addStage('b', 'character');

    pipeline.startStage('a');
    pipeline.failStage('a', 'error');

    expect(pipeline.hasFailed()).toBe(true);
  });

  it('retrieves stages by name', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('grammar', 'grammar');

    const stage = pipeline.getStage('grammar');
    expect(stage).toBeDefined();
    expect(stage!.name).toBe('grammar');

    const missing = pipeline.getStage('nonexistent');
    expect(missing).toBeUndefined();
  });

  it('skipped stages count as complete', () => {
    const pipeline = new RevisionPipeline();
    pipeline.addStage('skipped', 'grammar');
    pipeline.state.stages[0]!.status = 'skipped';

    expect(pipeline.isComplete()).toBe(true);
  });
});
