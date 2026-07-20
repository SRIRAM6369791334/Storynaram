import { describe, it, expect } from 'vitest';
import { WorkflowBuilder, WorkflowDefinition, WorkflowStateMachine } from '../src/workflow';

describe('WorkflowBuilder', () => {
  it('should create a workflow with single step', () => {
    const def = WorkflowBuilder.create('test-flow')
      .withVersion('1.0.0')
      .addStep('step1', 'Validation')
      .withConfig({ schemaId: 'core/BaseEntity.schema.json' })
      .end()
      .build();

    expect(def).toBeInstanceOf(WorkflowDefinition);
    expect(def.name).toBe('test-flow');
    expect(def.version).toBe('1.0.0');
    expect(def.getStepCount()).toBe(1);
  });

  it('should create workflow with multiple steps', () => {
    const def = WorkflowBuilder.create('multi-step')
      .withVersion('2.0.0')
      .withDescription('A multi-step workflow')
      .addStep('validate', 'Validation')
      .withConfig({ schemaId: 'core/BaseEntity.schema.json' })
      .onSuccess('process')
      .end()
      .addStep('process', 'Repository')
      .withConfig({ operation: 'create', entityType: 'character' })
      .onSuccess('complete')
      .onFailure('cleanup')
      .end()
      .addStep('cleanup', 'Compensation')
      .withConfig({})
      .end()
      .addStep('complete', 'Custom')
      .withConfig({})
      .end()
      .build();

    expect(def.getStepCount()).toBe(4);
    expect(def.getStep('validate')?.nextOnSuccess).toBe('process');
    expect(def.getStep('process')?.nextOnSuccess).toBe('complete');
    expect(def.getStep('process')?.nextOnFailure).toBe('cleanup');
  });

  it('should validate step references', () => {
    expect(() => {
      WorkflowBuilder.create('bad-flow')
        .addStep('step1', 'Validation')
        .onSuccess('nonexistent')
        .end()
        .build();
    }).toThrow('references unknown nextOnSuccess: nonexistent');
  });

  it('should reject duplicate step ids', () => {
    const builder = WorkflowBuilder.create('dup-flow')
      .addStep('step1', 'Validation').end();

    expect(() => {
      builder.addStep('step1', 'Repository').end().build();
    }).toThrow('Duplicate step id: step1');
  });

  it('should reject workflow with no steps', () => {
    expect(() => {
      WorkflowBuilder.create('empty').build();
    }).toThrow('Cannot build workflow with no steps');
  });

  it('should support retry configuration', () => {
    const def = WorkflowBuilder.create('retry-flow')
      .addStep('step1', 'Repository')
      .withRetry({ maxRetries: 3, baseDelayMs: 100, maxDelayMs: 1000, backoffMultiplier: 2 })
      .end()
      .build();

    expect(def.getStep('step1')?.retry?.maxRetries).toBe(3);
    expect(def.getStep('step1')?.retry?.backoffMultiplier).toBe(2);
  });

  it('should support timeout configuration', () => {
    const def = WorkflowBuilder.create('timeout-flow')
      .addStep('step1', 'Delay')
      .withTimeout({ timeoutMs: 5000, actionOnTimeout: 'fail' })
      .end()
      .build();

    expect(def.getStep('step1')?.timeout?.timeoutMs).toBe(5000);
    expect(def.getStep('step1')?.timeout?.actionOnTimeout).toBe('fail');
  });

  it('should support rollback configuration', () => {
    const def = WorkflowBuilder.create('rollback-flow')
      .addStep('step1', 'Repository')
      .withRollback({ enabled: true, compensationRequired: true, autoRollbackOnFailure: true })
      .compensationStep('comp-step')
      .end()
      .addStep('comp-step', 'Compensation')
      .end()
      .build();

    expect(def.getStep('step1')?.rollback?.enabled).toBe(true);
    expect(def.getStep('step1')?.compensationStepId).toBe('comp-step');
  });

  it('should support metadata', () => {
    const def = WorkflowBuilder.create('meta-flow')
      .withMetadata({ author: 'test', category: 'onboarding' })
      .addStep('step1', 'Custom')
      .end()
      .build();

    expect(def.metadata.author).toBe('test');
    expect(def.metadata.category).toBe('onboarding');
  });

  it('should support step labels and descriptions', () => {
    const def = WorkflowBuilder.create('labeled-flow')
      .addStep('step1', 'Validation')
      .withLabel('Validate Input')
      .withDescription('Validates the input data against schema')
      .end()
      .build();

    expect(def.getStep('step1')?.label).toBe('Validate Input');
    expect(def.getStep('step1')?.description).toBe('Validates the input data against schema');
  });

  it('should get initial step', () => {
    const def = WorkflowBuilder.create('init-flow')
      .addStep('first', 'Validation')
      .end()
      .addStep('second', 'Repository')
      .end()
      .build();

    expect(def.getInitialStep()?.id).toBe('first');
  });

  it('should get next steps by transition', () => {
    const def = WorkflowBuilder.create('next-flow')
      .addStep('a', 'Validation')
      .onSuccess('b')
      .end()
      .addStep('b', 'Repository')
      .onSuccess('c')
      .onFailure('d')
      .end()
      .addStep('c', 'Custom')
      .end()
      .addStep('d', 'Compensation')
      .end()
      .build();

    const successSteps = def.getNextSteps('b', 'success');
    expect(successSteps).toHaveLength(1);
    expect(successSteps[0]!.id).toBe('c');

    const failureSteps = def.getNextSteps('b', 'failure');
    expect(failureSteps).toHaveLength(1);
    expect(failureSteps[0]!.id).toBe('d');
  });
});

describe('WorkflowStateMachine', () => {
  const machine = new WorkflowStateMachine();

  it('should allow Created -> Ready', () => {
    expect(machine.canTransition('Created', 'success')).toBe(true);
    expect(machine.transition('Created', 'success')).toBe('Ready');
  });

  it('should allow Ready -> Running', () => {
    expect(machine.transition('Ready', 'success')).toBe('Running');
  });

  it('should allow Running -> Completed', () => {
    expect(machine.transition('Running', 'success')).toBe('Completed');
  });

  it('should allow Running -> Failed', () => {
    expect(machine.transition('Running', 'failure')).toBe('Failed');
  });

  it('should allow Running -> Cancelled', () => {
    expect(machine.transition('Running', 'cancel')).toBe('Cancelled');
  });

  it('should allow Running -> Paused', () => {
    expect(machine.transition('Running', 'cancel')).toBe('Cancelled');
  });

  it('should allow Failed -> RolledBack', () => {
    const failed = machine.transition('Running', 'failure');
    expect(failed).toBe('Failed');
    expect(machine.transition('Failed', 'rollback')).toBe('RolledBack');
  });

  it('should reject invalid transitions', () => {
    expect(machine.canTransition('Completed', 'success')).toBe(false);
    expect(machine.canTransition('Archived', 'success')).toBe(false);
    expect(() => machine.transition('Completed', 'success')).toThrow();
  });

  it('should detect terminal states', () => {
    expect(machine.isTerminal('Completed')).toBe(true);
    expect(machine.isTerminal('Failed')).toBe(true);
    expect(machine.isTerminal('Cancelled')).toBe(true);
    expect(machine.isTerminal('Archived')).toBe(true);
    expect(machine.isTerminal('Running')).toBe(false);
    expect(machine.isTerminal('Ready')).toBe(false);
  });

  it('should detect active states', () => {
    expect(machine.isActive('Running')).toBe(true);
    expect(machine.isActive('Ready')).toBe(true);
    expect(machine.isActive('Paused')).toBe(true);
    expect(machine.isActive('Retrying')).toBe(true);
    expect(machine.isActive('Completed')).toBe(false);
    expect(machine.isActive('Failed')).toBe(false);
  });

  it('should list valid transitions', () => {
    const transitions = machine.getValidTransitions('Running');
    expect(transitions).toContain('success');
    expect(transitions).toContain('failure');
    expect(transitions).toContain('cancel');
    expect(transitions).toContain('retry');
    expect(transitions).toContain('timeout');
    expect(transitions).not.toContain('rollback');
  });
});
