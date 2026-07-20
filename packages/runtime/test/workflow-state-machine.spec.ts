import { describe, it, expect } from 'vitest';
import { WorkflowStateMachine, WorkflowBuilder } from '../src/workflow';

describe('WorkflowStateMachine - comprehensive', () => {
  const machine = new WorkflowStateMachine();

  it('should validate all created transitions', () => {
    expect(machine.canTransition('Created', 'success')).toBe(true);
    expect(machine.transition('Created', 'success')).toBe('Ready');
  });

  it('should validate all ready transitions', () => {
    expect(machine.transition('Ready', 'success')).toBe('Running');
  });

  it('should validate all running transitions', () => {
    expect(machine.transition('Running', 'success')).toBe('Completed');
    expect(machine.transition('Running', 'failure')).toBe('Failed');
    expect(machine.transition('Running', 'retry')).toBe('Retrying');
    expect(machine.transition('Running', 'timeout')).toBe('TimedOut');
    expect(machine.transition('Running', 'cancel')).toBe('Cancelled');
    expect(machine.transition('Running', 'skip')).toBe('Completed');
  });

  it('should validate all paused transitions', () => {
    expect(machine.transition('Paused', 'success')).toBe('Running');
  });

  it('should validate all waiting transitions', () => {
    expect(machine.transition('Waiting', 'success')).toBe('Running');
  });

  it('should validate all failed transitions', () => {
    expect(machine.transition('Failed', 'rollback')).toBe('RolledBack');
  });

  it('should validate all retrying transitions', () => {
    expect(machine.transition('Retrying', 'success')).toBe('Running');
    expect(machine.transition('Retrying', 'failure')).toBe('Failed');
    expect(machine.transition('Retrying', 'timeout')).toBe('TimedOut');
  });

  it('should validate all timedout transitions', () => {
    expect(machine.transition('TimedOut', 'rollback')).toBe('RolledBack');
  });

  it('should reject transitions from terminal states', () => {
    expect(machine.canTransition('Completed', 'success')).toBe(false);
    expect(machine.canTransition('Cancelled', 'success')).toBe(false);
    expect(machine.canTransition('RolledBack', 'retry')).toBe(false);
    expect(machine.canTransition('Archived', 'success')).toBe(false);
  });

  it('should distinguish terminal vs non-terminal states', () => {
    const terminalStates = ['Completed', 'Failed', 'Cancelled', 'TimedOut', 'RolledBack', 'Archived'];
    const nonTerminalStates = ['Created', 'Ready', 'Running', 'Paused', 'Waiting', 'Retrying'];

    for (const state of terminalStates) {
      expect(machine.isTerminal(state as any)).toBe(true);
    }
    for (const state of nonTerminalStates) {
      expect(machine.isTerminal(state as any)).toBe(false);
    }
  });

  it('should distinguish active vs inactive states', () => {
    const activeStates = ['Ready', 'Running', 'Paused', 'Waiting', 'Retrying'];
    const inactiveStates = ['Created', 'Completed', 'Failed', 'Cancelled', 'TimedOut', 'RolledBack', 'Archived'];

    for (const state of activeStates) {
      expect(machine.isActive(state as any)).toBe(true);
    }
    for (const state of inactiveStates) {
      expect(machine.isActive(state as any)).toBe(false);
    }
  });
});

describe('WorkflowDefinition navigation', () => {
  it('should build and navigate a linear workflow', () => {
    const def = WorkflowBuilder.create('linear')
      .addStep('a', 'Validation').onSuccess('b').end()
      .addStep('b', 'Repository').onSuccess('c').end()
      .addStep('c', 'Custom').end()
      .build();

    expect(def.getInitialStep()!.id).toBe('a');
    expect(def.getNextSteps('a', 'success')[0]!.id).toBe('b');
    expect(def.getNextSteps('b', 'success')[0]!.id).toBe('c');
    expect(def.getNextSteps('c', 'success')).toHaveLength(0);
  });

  it('should build a workflow with error handling', () => {
    const def = WorkflowBuilder.create('with-errors')
      .addStep('validate', 'Validation')
      .onSuccess('process')
      .onFailure('error-handler')
      .end()
      .addStep('process', 'Repository')
      .onSuccess('complete')
      .onFailure('error-handler')
      .end()
      .addStep('error-handler', 'Compensation')
      .end()
      .addStep('complete', 'Custom')
      .end()
      .build();

    expect(def.getNextSteps('validate', 'failure')[0]!.id).toBe('error-handler');
    expect(def.getNextSteps('process', 'failure')[0]!.id).toBe('error-handler');
  });

  it('should get all step ids', () => {
    const def = WorkflowBuilder.create('all-ids')
      .addStep('s1', 'Validation').end()
      .addStep('s2', 'Repository').end()
      .addStep('s3', 'Custom').end()
      .build();

    expect(def.getAllStepIds()).toEqual(['s1', 's2', 's3']);
  });
});
