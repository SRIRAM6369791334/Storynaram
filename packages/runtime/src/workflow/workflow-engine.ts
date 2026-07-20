import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { ValidationEngineService } from '@storynaram/validation';
import { RepositoryManager } from '../repository/repository-manager';
import { RelationshipService } from '../relationship/relationship-service';
import { QueryEngineService } from '../query/query-engine.service';
import { WorkflowDefinition } from './workflow-definition';
import { WorkflowBuilder } from './workflow-builder';
import { WorkflowExecutor } from './workflow-executor';
import { WorkflowRegistry } from './workflow-registry';
import { WorkflowInstanceManager } from './workflow-instance';
import { WorkflowContext } from './workflow-context';
import { WorkflowHistoryService } from './workflow-history';
import { WorkflowCheckpointService } from './workflow-checkpoint';
import { WorkflowMetricsService } from './workflow-metrics';
import { WorkflowStateMachine } from './workflow-state-machine';
import { WorkflowScheduler } from './workflow-scheduler';
import type {
  WorkflowInstance,
  WorkflowResult,
  WorkflowStatistics,
  WorkflowMetrics,
  HistoryEntry,
  WorkflowOptions,
  StepType,
  WorkflowRuntimeOptions,
  RetryPolicy,
  TimeoutPolicy,
  RollbackPolicy,
} from './types';

@Injectable()
export class WorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);

  constructor(
    readonly registry: WorkflowRegistry,
    readonly executor: WorkflowExecutor,
    readonly instanceManager: WorkflowInstanceManager,
    readonly context: WorkflowContext,
    readonly history: WorkflowHistoryService,
    readonly checkpoint: WorkflowCheckpointService,
    readonly metrics: WorkflowMetricsService,
    readonly stateMachine: WorkflowStateMachine,
    readonly scheduler: WorkflowScheduler,
    readonly repositoryManager?: RepositoryManager,
    readonly relationshipService?: RelationshipService,
    readonly queryEngine?: QueryEngineService,
    readonly validationEngine?: ValidationEngineService,
  ) {}

  define(name: string): WorkflowBuilder {
    return WorkflowBuilder.create(name);
  }

  register(definition: WorkflowDefinition): void {
    this.registry.register(definition);
  }

  async start(
    definition: WorkflowDefinition,
    initialContext: Record<string, unknown> = {},
  ): Promise<WorkflowInstance> {
    return this.executor.start(definition, initialContext);
  }

  async startByName(
    name: string,
    initialContext: Record<string, unknown> = {},
    version?: string,
  ): Promise<WorkflowInstance> {
    const definition = this.registry.resolve(name, version);
    return this.start(definition, initialContext);
  }

  async pause(workflowId: string): Promise<void> {
    return this.executor.pause(workflowId);
  }

  async resume(workflowId: string, definition?: WorkflowDefinition): Promise<void> {
    const instance = this.instanceManager.get(workflowId);
    if (!instance) throw new Error(`Workflow instance not found: ${workflowId}`);

    const def = definition ?? this.registry.resolve(instance.workflowName, instance.version);
    await this.executor.resume(workflowId, def);
  }

  async cancel(workflowId: string): Promise<void> {
    return this.executor.cancel(workflowId);
  }

  async getInstance(workflowId: string): Promise<WorkflowInstance | undefined> {
    return this.instanceManager.get(workflowId);
  }

  async getResult(workflowId: string): Promise<WorkflowResult | undefined> {
    const instance = this.instanceManager.get(workflowId);
    if (!instance) return undefined;

    return {
      workflowId: instance.id,
      workflowName: instance.workflowName,
      status: instance.status,
      steps: instance.history
        .filter(h => h.stepId)
        .map(h => ({
          stepId: h.stepId!,
          success: h.status === 'Completed',
          output: h.data,
          error: h.data.error as string | null ?? null,
          durationMs: h.durationMs ?? 0,
          transition: 'success' as const,
          retryAttempt: 0,
        })),
      totalDurationMs: instance.startedAt && instance.completedAt
        ? instance.completedAt.getTime() - instance.startedAt.getTime()
        : 0,
      error: instance.error,
      context: instance.context,
      checkpointCount: instance.checkpoint ? 1 : 0,
    };
  }

  async getHistory(workflowId: string): Promise<HistoryEntry[]> {
    return this.history.getHistory(workflowId);
  }

  async getStatistics(): Promise<WorkflowStatistics> {
    const allInstances = this.instanceManager.getAll();
    const active = allInstances.filter(i => this.stateMachine.isActive(i.status));
    const completed = allInstances.filter(i => i.status === 'Completed');
    const failed = allInstances.filter(i => i.status === 'Failed');
    const paused = allInstances.filter(i => i.status === 'Paused');
    const durations = completed.map(i => {
      if (!i.startedAt || !i.completedAt) return 0;
      return i.completedAt.getTime() - i.startedAt.getTime();
    });
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    const totalSteps = allInstances.reduce((sum, i) => sum + i.history.length, 0);
    const totalRetries = allInstances.reduce((sum, i) => sum + i.retryCount, 0);

    return {
      totalWorkflows: allInstances.length,
      activeWorkflows: active.length,
      completedWorkflows: completed.length,
      failedWorkflows: failed.length,
      pausedWorkflows: paused.length,
      averageDurationMs: avgDuration,
      totalStepsExecuted: totalSteps,
      totalRetries,
      totalRollbacks: 0,
      cacheHitRate: 0,
    };
  }

  getMetrics(workflowName: string): WorkflowMetrics | undefined {
    return this.metrics.getMetrics(workflowName);
  }

  getAllMetrics(): WorkflowMetrics[] {
    return this.metrics.getAllMetrics();
  }

  listWorkflows(): string[] {
    return this.registry.listNames();
  }

  getActiveInstances(): WorkflowInstance[] {
    return this.instanceManager.getActive();
  }

  async restoreFromCheckpoint(workflowId: string, definition?: WorkflowDefinition): Promise<WorkflowInstance | null> {
    const checkpoint = await this.checkpoint.restore(workflowId);
    if (!checkpoint) return null;

    const instance = this.instanceManager.get(workflowId);
    if (!instance) return null;

    const def = definition ?? this.registry.resolve(instance.workflowName, instance.version);
    await this.executor.resume(workflowId, def);
    return instance;
  }
}
