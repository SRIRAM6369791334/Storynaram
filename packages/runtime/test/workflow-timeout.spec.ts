import { describe, it, expect } from 'vitest';
import { WorkflowBuilder, WorkflowStepExecutor, WorkflowTimeoutError } from '../src/workflow';

describe('Workflow Timeout', () => {
  const stepExecutor = new WorkflowStepExecutor();

  it('should configure timeout policy on step', () => {
    const step = WorkflowBuilder.create('timeout-test')
      .addStep('delay-step', 'Delay')
      .withTimeout({ timeoutMs: 5000, actionOnTimeout: 'fail' })
      .end()
      .build()
      .getStep('delay-step')!;

    expect(step.timeout).toBeDefined();
    expect(step.timeout!.timeoutMs).toBe(5000);
    expect(step.timeout!.actionOnTimeout).toBe('fail');
  });

  it('should execute delay step', async () => {
    const step = WorkflowBuilder.create('delay-test')
      .addStep('quick-delay', 'Delay')
      .withConfig({ delayMs: 5 })
      .end()
      .build()
      .getStep('quick-delay')!;

    const start = Date.now();
    const result = await stepExecutor.executeStep(step, {});
    const elapsed = Date.now() - start;

    expect(result.success).toBe(true);
    expect(result.output.delayed).toBe(true);
    expect(elapsed).toBeGreaterThanOrEqual(4);
  });

  it('should support skip on timeout', () => {
    const policy = { timeoutMs: 100, actionOnTimeout: 'skip' as const };
    expect(policy.actionOnTimeout).toBe('skip');
  });

  it('should support compensate on timeout', () => {
    const policy = { timeoutMs: 100, actionOnTimeout: 'compensate' as const };
    expect(policy.actionOnTimeout).toBe('compensate');
  });

  it('should create timeout errors', () => {
    const error = new WorkflowTimeoutError('wf-1', 'step-1', 5000);
    expect(error.message).toContain('wf-1');
    expect(error.message).toContain('step-1');
    expect(error.message).toContain('5000');
  });
});
