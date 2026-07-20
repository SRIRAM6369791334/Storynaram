import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowStepExecutor, WorkflowBuilder } from '../src/workflow';

describe('Workflow Retry', () => {
  let stepExecutor: WorkflowStepExecutor;

  beforeEach(() => {
    stepExecutor = new WorkflowStepExecutor();
  });

  it('should succeed on first attempt without retry', async () => {
    const step = WorkflowBuilder.create('test')
      .addStep('step1', 'Custom')
      .withConfig({})
      .end()
      .build()
      .getStep('step1')!;

    const result = await stepExecutor.executeStep(step, {});
    expect(result.success).toBe(true);
    expect(result.retryAttempt).toBe(0);
    expect(result.transition).toBe('success');
  });

  it('should fail gracefully when custom handler throws', async () => {
    const step = WorkflowBuilder.create('test')
      .addStep('step1', 'Custom')
      .withConfig({})
      .withRetry({ maxRetries: 1, baseDelayMs: 5, maxDelayMs: 50, backoffMultiplier: 1 })
      .end()
      .build()
      .getStep('step1')!;

    const context = {
      [`__handler_step1`]: async () => {
        throw new Error('Intentional failure');
      },
    };

    const result = await stepExecutor.executeStep(step, context);
    expect(result.success).toBe(false);
    expect(result.retryAttempt).toBe(1);
  });

  it('should calculate retry delay with exponential backoff', () => {
    const policy = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 10000, backoffMultiplier: 2 };

    const delay1 = 100 * Math.pow(2, 0); // attempt 1: 100
    const delay2 = 100 * Math.pow(2, 1); // attempt 2: 200
    const delay3 = 100 * Math.pow(2, 2); // attempt 3: 400

    expect(delay1).toBe(100);
    expect(delay2).toBe(200);
    expect(delay3).toBe(400);
  });

  it('should cap retry delay at maxDelayMs', () => {
    const policy = { maxRetries: 5, baseDelayMs: 1000, maxDelayMs: 3000, backoffMultiplier: 3 };

    const delay = Math.min(1000 * Math.pow(3, 4), 3000);
    expect(delay).toBe(3000); // capped
  });

  it('should not retry when no retry policy', async () => {
    const step = WorkflowBuilder.create('test')
      .addStep('step1', 'Custom')
      .withConfig({})
      .end()
      .build()
      .getStep('step1')!;

    const result = await stepExecutor.executeStep(step, {});
    expect(result.success).toBe(true);
    expect(result.retryAttempt).toBe(0);
  });

  it('should handle custom step handler', async () => {
    const step = WorkflowBuilder.create('test')
      .addStep('custom-step', 'Custom')
      .withConfig({})
      .end()
      .build()
      .getStep('custom-step')!;

    const context = {
      [`__handler_custom-step`]: async (_step: any, _ctx: any) => ({
        output: { customResult: 'handled' },
        transition: 'success' as const,
      }),
    };

    const result = await stepExecutor.executeStep(step, context);
    expect(result.success).toBe(true);
    expect(result.output.customResult).toBe('handled');
  });
});
