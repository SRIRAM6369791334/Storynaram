import { describe, it, expect } from 'vitest';
import { WorkflowBuilder, WorkflowDefinition, WorkflowStateMachine, WorkflowRegistry } from '../src/workflow';

describe('Workflow Benchmarks', () => {
  const iterations = 1000;

  it('should build 1K workflows', () => {
    for (let i = 0; i < iterations; i++) {
      const def = WorkflowBuilder.create(`bench-flow-${i}`)
        .addStep('validate', 'Validation')
        .withConfig({ schemaId: 'core/BaseEntity.schema.json' })
        .onSuccess('process')
        .end()
        .addStep('process', 'Repository')
        .withConfig({ operation: 'create', entityType: 'character' })
        .onSuccess('complete')
        .end()
        .addStep('complete', 'Custom')
        .withConfig({})
        .end()
        .build();
      expect(def.getStepCount()).toBe(3);
    }
  });

  it('should register 1K workflow definitions', () => {
    const registry = new WorkflowRegistry();
    for (let i = 0; i < iterations; i++) {
      const def = WorkflowBuilder.create(`reg-flow-${i}`)
        .withVersion('1.0.0')
        .addStep('s1', 'Custom')
        .withConfig({})
        .end()
        .build();
      registry.register(def);
    }
    expect(registry.count()).toBe(iterations);
  });

  it('should resolve 1K state transitions', () => {
    const machine = new WorkflowStateMachine();
    for (let i = 0; i < iterations; i++) {
      machine.transition('Created', 'success');
      machine.transition('Ready', 'success');
      machine.transition('Running', 'success');
      machine.transition('Running', 'failure');
      machine.transition('Failed', 'rollback');
    }
  });

  it('should check 10K state machine transitions', () => {
    const machine = new WorkflowStateMachine();
    const states = ['Created', 'Ready', 'Running', 'Paused', 'Waiting', 'Completed', 'Failed', 'Cancelled', 'Retrying', 'TimedOut', 'RolledBack', 'Archived'];
    let count = 0;
    for (let i = 0; i < 10000; i++) {
      for (const state of states) {
        if (machine.isTerminal(state as any)) count++;
        if (machine.isActive(state as any)) count++;
        machine.getValidTransitions(state as any);
      }
    }
    expect(count).toBeGreaterThan(0);
  });

  it('should validate 1K workflow definitions', () => {
    for (let i = 0; i < iterations; i++) {
      expect(() => {
        WorkflowBuilder.create(`valid-flow-${i}`)
          .addStep('s1', 'Validation')
          .withConfig({})
          .end()
          .build();
      }).not.toThrow();
    }
  });
});
