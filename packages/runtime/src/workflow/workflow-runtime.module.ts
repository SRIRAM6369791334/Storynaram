import { DynamicModule, Module, Global } from '@nestjs/common';
import { WorkflowEngine } from './workflow-engine';
import { WorkflowExecutor } from './workflow-executor';
import { WorkflowStepExecutor } from './workflow-step';
import { WorkflowStateMachine } from './workflow-state-machine';
import { WorkflowInstanceManager } from './workflow-instance';
import { WorkflowContext } from './workflow-context';
import { WorkflowHistoryService } from './workflow-history';
import { WorkflowCheckpointService } from './workflow-checkpoint';
import { WorkflowMetricsService } from './workflow-metrics';
import { WorkflowRegistry } from './workflow-registry';
import { WorkflowScheduler } from './workflow-scheduler';
import type { WorkflowRuntimeOptions } from './types';
import { WORKFLOW_OPTIONS } from './tokens';

const DEFAULT_OPTIONS: WorkflowRuntimeOptions = {
  enableCheckpoints: true,
  enableHistory: true,
  enableMetrics: true,
  enableParallelism: true,
  defaultTimeoutMs: 30000,
  maxRetriesPerStep: 3,
  maxParallelSteps: 4,
  checkpointIntervalMs: 5000,
};

@Global()
@Module({})
export class WorkflowRuntimeModule {
  static forRoot(options?: WorkflowRuntimeOptions): DynamicModule {
    const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
    return {
      module: WorkflowRuntimeModule,
      global: true,
      providers: [
        { provide: WORKFLOW_OPTIONS, useValue: resolvedOptions },
        WorkflowStateMachine,
        WorkflowScheduler,
        WorkflowInstanceManager,
        WorkflowContext,
        WorkflowRegistry,
        WorkflowMetricsService,
        {
          provide: WorkflowHistoryService,
          useFactory: () => new WorkflowHistoryService(),
        },
        {
          provide: WorkflowCheckpointService,
          useFactory: (
            history: WorkflowHistoryService,
            context: WorkflowContext,
          ) => new WorkflowCheckpointService(history, context, { enabled: resolvedOptions.enableCheckpoints }),
          inject: [WorkflowHistoryService, WorkflowContext],
        },
        {
          provide: WorkflowStepExecutor,
          useFactory: () => new WorkflowStepExecutor(),
        },
        {
          provide: WorkflowExecutor,
          useFactory: (
            stateMachine: WorkflowStateMachine,
            stepExecutor: WorkflowStepExecutor,
            instanceManager: WorkflowInstanceManager,
            context: WorkflowContext,
            history: WorkflowHistoryService,
            checkpoint: WorkflowCheckpointService,
            scheduler: WorkflowScheduler,
          ) => new WorkflowExecutor(stateMachine, stepExecutor, instanceManager, context, history, checkpoint, scheduler),
          inject: [
            WorkflowStateMachine,
            WorkflowStepExecutor,
            WorkflowInstanceManager,
            WorkflowContext,
            WorkflowHistoryService,
            WorkflowCheckpointService,
            WorkflowScheduler,
          ],
        },
        {
          provide: WorkflowEngine,
          useFactory: (
            registry: WorkflowRegistry,
            executor: WorkflowExecutor,
            instanceManager: WorkflowInstanceManager,
            context: WorkflowContext,
            history: WorkflowHistoryService,
            checkpoint: WorkflowCheckpointService,
            metrics: WorkflowMetricsService,
            stateMachine: WorkflowStateMachine,
            scheduler: WorkflowScheduler,
          ) => new WorkflowEngine(
            registry, executor, instanceManager, context, history, checkpoint, metrics,
            stateMachine, scheduler,
          ),
          inject: [
            WorkflowRegistry,
            WorkflowExecutor,
            WorkflowInstanceManager,
            WorkflowContext,
            WorkflowHistoryService,
            WorkflowCheckpointService,
            WorkflowMetricsService,
            WorkflowStateMachine,
            WorkflowScheduler,
          ],
        },
      ],
      exports: [
        WorkflowEngine,
        WorkflowExecutor,
        WorkflowStepExecutor,
        WorkflowStateMachine,
        WorkflowInstanceManager,
        WorkflowContext,
        WorkflowHistoryService,
        WorkflowCheckpointService,
        WorkflowMetricsService,
        WorkflowRegistry,
        WorkflowScheduler,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: WorkflowRuntimeModule,
      providers: [
        WorkflowEngine,
        WorkflowExecutor,
        WorkflowStepExecutor,
        WorkflowStateMachine,
        WorkflowInstanceManager,
        WorkflowContext,
        WorkflowHistoryService,
        WorkflowCheckpointService,
        WorkflowMetricsService,
        WorkflowRegistry,
        WorkflowScheduler,
      ],
      exports: [
        WorkflowEngine,
        WorkflowExecutor,
        WorkflowStepExecutor,
        WorkflowStateMachine,
        WorkflowInstanceManager,
        WorkflowContext,
        WorkflowHistoryService,
        WorkflowCheckpointService,
        WorkflowMetricsService,
        WorkflowRegistry,
        WorkflowScheduler,
      ],
    };
  }
}
