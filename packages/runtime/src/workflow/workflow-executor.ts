import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { WorkflowDefinition } from './workflow-definition';
import { WorkflowStateMachine } from './workflow-state-machine';
import { WorkflowStepExecutor } from './workflow-step';
import { WorkflowInstanceManager } from './workflow-instance';
import { WorkflowContext } from './workflow-context';
import { WorkflowHistoryService } from './workflow-history';
import { WorkflowCheckpointService } from './workflow-checkpoint';
import { WorkflowScheduler } from './workflow-scheduler';
import type { WorkflowInstance, WorkflowStatus, StepResult, WorkflowResult, HistoryEntry, WorkflowEventType } from './types';
import { WorkflowExecutionError } from './errors';

@Injectable()
export class WorkflowExecutor {
  private readonly logger = new Logger(WorkflowExecutor.name);

  constructor(
    private readonly stateMachine: WorkflowStateMachine,
    private readonly stepExecutor: WorkflowStepExecutor,
    private readonly instanceManager: WorkflowInstanceManager,
    private readonly context: WorkflowContext,
    private readonly history: WorkflowHistoryService,
    private readonly checkpoint: WorkflowCheckpointService,
    private readonly scheduler: WorkflowScheduler,
  ) {}

  async start(
    definition: WorkflowDefinition,
    initialContext: Record<string, unknown> = {},
  ): Promise<WorkflowInstance> {
    const instance = this.instanceManager.create(definition.name, definition.version, initialContext);
    this.context.setAll(instance.id, initialContext);

    await this.transition(instance.id, 'Ready', 'success');
    await this.recordHistory(instance.id, null, 'WorkflowStarted', 'Ready');

    this.scheduler.schedule(async () => {
      try {
        await this.executeSteps(instance.id, definition);
      } catch (error) {
        this.logger.error(`Workflow ${instance.id} execution failed`, error);
        await this.transition(instance.id, 'Failed', 'failure');
        this.instanceManager.setError(instance.id, error instanceof Error ? error.message : String(error));
        await this.recordHistory(instance.id, null, 'WorkflowFailed', 'Failed', { error });
      }
    });

    return instance;
  }

  private async executeSteps(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    const instance = this.instanceManager.get(workflowId);
    if (!instance) return;

    await this.transition(workflowId, 'Running', 'success');

    let currentStep = definition.getInitialStep();
    const stepResults: StepResult[] = [];

    while (currentStep) {
      this.instanceManager.updateStep(workflowId, currentStep.id);
      await this.recordHistory(workflowId, currentStep.id, 'WorkflowStepStarted', 'Running');

      const contextData = this.context.getAll(workflowId);
      const result = await this.stepExecutor.executeStep(currentStep, contextData, currentStep.retry);

      stepResults.push(result);

      if (result.success) {
        this.context.merge(workflowId, result.output);
        await this.recordHistory(workflowId, currentStep.id, 'WorkflowStepCompleted', 'Completed', result.output, result.durationMs);

        if (result.transition === 'retry') {
          this.instanceManager.incrementRetry(workflowId);
          await this.recordHistory(workflowId, currentStep.id, 'WorkflowRetried', 'Retrying');
          continue;
        }

        await this.maybeCheckpoint(workflowId, currentStep.id);

        const nextSteps = definition.getNextSteps(currentStep.id, 'success');
        currentStep = nextSteps[0] ?? undefined;
      } else {
        this.instanceManager.setError(workflowId, result.error ?? 'Unknown error');
        await this.recordHistory(workflowId, currentStep.id, 'WorkflowStepFailed', 'Failed', { error: result.error }, result.durationMs);

        if (currentStep.rollback?.enabled && currentStep.rollback.autoRollbackOnFailure) {
          await this.executeRollback(workflowId, definition, currentStep.id);
          break;
        }

        if (currentStep.nextOnFailure) {
          currentStep = definition.getStep(currentStep.nextOnFailure) ?? undefined;
        } else {
          break;
        }
      }
    }

    const finalInstance = this.instanceManager.get(workflowId);
    if (finalInstance && finalInstance.status === 'Running') {
      await this.transition(workflowId, 'Completed', 'success');
      await this.recordHistory(workflowId, null, 'WorkflowCompleted', 'Completed');
    }
  }

  async pause(workflowId: string): Promise<void> {
    await this.transition(workflowId, 'Paused', 'cancel');
    await this.recordHistory(workflowId, null, 'WorkflowPaused', 'Paused');
  }

  async resume(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    await this.transition(workflowId, 'Running', 'success');
    await this.recordHistory(workflowId, null, 'WorkflowResumed', 'Running');

    this.scheduler.schedule(async () => {
      await this.executeSteps(workflowId, definition);
    });
  }

  async cancel(workflowId: string): Promise<void> {
    await this.transition(workflowId, 'Cancelled', 'cancel');
    await this.recordHistory(workflowId, null, 'WorkflowCancelled', 'Cancelled');
  }

  async executeRollback(workflowId: string, definition: WorkflowDefinition, fromStepId: string): Promise<void> {
    const stepIds = definition.getAllStepIds();
    const rollbackSteps = stepIds.slice(0, stepIds.indexOf(fromStepId) + 1).reverse();

    for (const stepId of rollbackSteps) {
      const step = definition.getStep(stepId);
      if (!step?.compensationStepId) continue;
      const compensationStep = definition.getStep(step.compensationStepId);
      if (!compensationStep) continue;

      try {
        const contextData = this.context.getAll(workflowId);
        await this.stepExecutor.executeStep(compensationStep, contextData);
        this.logger.log(`Rollback executed for step ${stepId} via compensation ${step.compensationStepId}`);
      } catch (error) {
        this.logger.error(`Rollback failed for step ${stepId}`, error);
      }
    }

    await this.transition(workflowId, 'RolledBack', 'rollback');
    await this.recordHistory(workflowId, null, 'WorkflowFailed', 'RolledBack');
  }

  private async transition(workflowId: string, status: WorkflowStatus, via: string): Promise<void> {
    const instance = this.instanceManager.get(workflowId);
    if (!instance) return;
    const newStatus = this.stateMachine.transition(instance.status, via as any);
    this.instanceManager.updateStatus(workflowId, newStatus);
  }

  private async recordHistory(
    workflowId: string,
    stepId: string | null,
    eventType: WorkflowEventType,
    status: string,
    data: Record<string, unknown> = {},
    durationMs: number | null = null,
  ): Promise<void> {
    const entry = this.instanceManager.createHistoryEntry(workflowId, stepId, eventType, status, data, durationMs);
    this.instanceManager.addHistory(workflowId, entry);
    await this.history.record(entry);
  }

  private async maybeCheckpoint(workflowId: string, stepId: string): Promise<void> {
    const instance = this.instanceManager.get(workflowId);
    if (!instance) return;
    await this.checkpoint.save(workflowId, stepId, this.context.getAll(workflowId));
    this.instanceManager.setCheckpoint(workflowId, stepId);
  }
}
