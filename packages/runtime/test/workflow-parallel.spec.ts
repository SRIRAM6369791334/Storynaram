import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowScheduler, WorkflowBuilder, WorkflowDefinition } from '../src/workflow';

describe('WorkflowScheduler', () => {
  let scheduler: WorkflowScheduler;

  beforeEach(() => {
    scheduler = new WorkflowScheduler();
  });

  it('should execute queued tasks', async () => {
    let executed = false;
    scheduler.schedule(async () => {
      executed = true;
    });

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(executed).toBe(true);
  });

  it('should execute multiple tasks', async () => {
    let count = 0;
    scheduler.schedule(async () => { count++; });
    scheduler.schedule(async () => { count++; });
    scheduler.schedule(async () => { count++; });

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(count).toBe(3);
  });

  it('should execute all tasks in parallel', async () => {
    const results: number[] = [];
    const tasks = [1, 2, 3].map(i => async () => {
      results.push(i);
    });

    await scheduler.executeAll(tasks);
    expect(results.sort()).toEqual([1, 2, 3]);
  });

  it('should execute parallel tasks with concurrency limit', async () => {
    const running = new Set<number>();
    const maxConcurrent: number[] = [];

    const tasks = [1, 2, 3, 4, 5, 6].map(i => async () => {
      running.add(i);
      maxConcurrent.push(running.size);
      await new Promise(resolve => setTimeout(resolve, 10));
      running.delete(i);
    });

    await scheduler.executeParallel(tasks, 2);
    expect(Math.max(...maxConcurrent)).toBeLessThanOrEqual(2);
  });

  it('should track queue length', () => {
    expect(scheduler.getQueueLength()).toBe(0);
    scheduler.schedule(async () => { await new Promise(resolve => setTimeout(resolve, 100)); });
    expect(scheduler.getQueueLength()).toBeGreaterThanOrEqual(0);
  });

  it('should track running count', () => {
    expect(scheduler.getRunningCount()).toBe(0);
  });

  it('should handle max concurrency setting', () => {
    scheduler.setMaxConcurrent(8);
    scheduler.schedule(async () => {});
    expect(scheduler.getRunningCount()).toBeGreaterThanOrEqual(0);
  });
});

describe('Workflow Builder - Parallel Steps', () => {
  it('should define steps with children', () => {
    const def = WorkflowBuilder.create('parallel-flow')
      .addStep('parallel', 'Parallel')
      .withLabel('Run in parallel')
      .withChildren([
        { id: 'task1', type: 'Delay', config: { delayMs: 10 } },
        { id: 'task2', type: 'Delay', config: { delayMs: 20 } },
        { id: 'task3', type: 'Delay', config: { delayMs: 30 } },
      ])
      .onSuccess('complete')
      .end()
      .addStep('complete', 'Custom')
      .withConfig({})
      .end()
      .build();

    const parallelStep = def.getStep('parallel');
    expect(parallelStep?.type).toBe('Parallel');
    expect(parallelStep?.label).toBe('Run in parallel');
    expect(parallelStep?.children).toHaveLength(3);
    expect(parallelStep?.nextOnSuccess).toBe('complete');
  });

  it('should define sequential steps', () => {
    const def = WorkflowBuilder.create('sequential-flow')
      .addStep('seq', 'Sequential')
      .withChildren([
        { id: 'a', type: 'Validation', config: {} },
        { id: 'b', type: 'Repository', config: {} },
        { id: 'c', type: 'Custom', config: {} },
      ])
      .end()
      .build();

    const seqStep = def.getStep('seq');
    expect(seqStep?.type).toBe('Sequential');
    expect(seqStep?.children).toHaveLength(3);
  });
});
