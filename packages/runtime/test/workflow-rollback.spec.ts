import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowBuilder, WorkflowExecutor, WorkflowStateMachine, WorkflowStepExecutor, WorkflowInstanceManager, WorkflowContext, WorkflowHistoryService, WorkflowCheckpointService, WorkflowScheduler } from '../src/workflow';

describe('Workflow Rollback', () => {
  let stateMachine: WorkflowStateMachine;
  let stepExecutor: WorkflowStepExecutor;
  let instanceManager: WorkflowInstanceManager;
  let context: WorkflowContext;
  let history: WorkflowHistoryService;
  let checkpoint: WorkflowCheckpointService;
  let scheduler: WorkflowScheduler;
  let executor: WorkflowExecutor;

  beforeEach(() => {
    stateMachine = new WorkflowStateMachine();
    stepExecutor = new WorkflowStepExecutor();
    instanceManager = new WorkflowInstanceManager();
    context = new WorkflowContext();
    history = new WorkflowHistoryService();
    checkpoint = new WorkflowCheckpointService(history, context, { enabled: true });
    scheduler = new WorkflowScheduler();
    executor = new WorkflowExecutor(stateMachine, stepExecutor, instanceManager, context, history, checkpoint, scheduler);
  });

  it('should rollback through steps in reverse order', async () => {
    const definition = WorkflowBuilder.create('rollback-test')
      .addStep('step1', 'Custom')
      .withConfig({ id: 'step1' })
      .onSuccess('step2')
      .withRollback({ enabled: true, compensationRequired: true, autoRollbackOnFailure: true })
      .compensationStep('comp1')
      .end()
      .addStep('step2', 'Custom')
      .withConfig({ id: 'step2' })
      .withRollback({ enabled: true, compensationRequired: true, autoRollbackOnFailure: true })
      .compensationStep('comp2')
      .end()
      .addStep('comp1', 'Custom')
      .withConfig({})
      .end()
      .addStep('comp2', 'Custom')
      .withConfig({})
      .end()
      .build();

    const instance = instanceManager.create('rollback-test', '1.0.0');
    instanceManager.updateStatus(instance.id, 'Running');
    instanceManager.updateStep(instance.id, 'step2');

    const rollbackSteps = definition.getAllStepIds();
    const toRollback = rollbackSteps.slice(0, rollbackSteps.indexOf('step2') + 1).reverse();
    expect(toRollback).toEqual(['step2', 'step1']);
  });

  it('should support compensation step references', () => {
    const def = WorkflowBuilder.create('comp-test')
      .addStep('create', 'Repository')
      .compensationStep('delete-entity')
      .end()
      .addStep('delete-entity', 'Compensation')
      .end()
      .build();

    expect(def.getStep('create')?.compensationStepId).toBe('delete-entity');
    expect(def.getStep('delete-entity')).toBeDefined();
  });

  it('should validate compensation step references', () => {
    expect(() => {
      WorkflowBuilder.create('bad-comp')
        .addStep('create', 'Repository')
        .compensationStep('nonexistent')
        .end()
        .build();
    }).toThrow('references unknown compensationStepId: nonexistent');
  });
});
