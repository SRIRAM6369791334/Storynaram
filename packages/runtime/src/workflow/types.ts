import type { EntityId } from '@storynaram/core';

export type WorkflowStatus =
  | 'Created'
  | 'Ready'
  | 'Running'
  | 'Paused'
  | 'Waiting'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Retrying'
  | 'TimedOut'
  | 'RolledBack'
  | 'Archived';

export type StepType =
  | 'Validation'
  | 'Repository'
  | 'Relationship'
  | 'Query'
  | 'Decision'
  | 'Condition'
  | 'Parallel'
  | 'Sequential'
  | 'Delay'
  | 'Event'
  | 'Compensation'
  | 'Custom';

export type TransitionType =
  | 'success'
  | 'failure'
  | 'retry'
  | 'timeout'
  | 'cancel'
  | 'rollback'
  | 'skip';

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface TimeoutPolicy {
  timeoutMs: number;
  actionOnTimeout: 'fail' | 'skip' | 'compensate';
}

export interface RollbackPolicy {
  enabled: boolean;
  compensationRequired: boolean;
  autoRollbackOnFailure: boolean;
}

export interface WorkflowOptions {
  maxRetriesPerStep?: number;
  defaultTimeoutMs?: number;
  enableCheckpoints?: boolean;
  checkpointIntervalMs?: number;
  enableParallelism?: boolean;
  maxParallelSteps?: number;
  enableHistory?: boolean;
  enableMetrics?: boolean;
}

export interface WorkflowDefinitionConfig {
  name: string;
  version: string;
  description?: string;
  steps: WorkflowStepConfig[];
  options?: WorkflowOptions;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStepConfig {
  id: string;
  type: StepType;
  label?: string;
  description?: string;
  config: Record<string, unknown>;
  nextOnSuccess?: string;
  nextOnFailure?: string;
  nextOnSkip?: string;
  retry?: RetryPolicy;
  timeout?: TimeoutPolicy;
  rollback?: RollbackPolicy;
  compensationStepId?: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  condition?: string;
  children?: WorkflowStepConfig[];
}

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  version: string;
  status: WorkflowStatus;
  currentStepId: string | null;
  context: Record<string, unknown>;
  history: HistoryEntry[];
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
  error: string | null;
  retryCount: number;
  checkpoint: string | null;
}

export interface HistoryEntry {
  id: string;
  workflowId: string;
  stepId: string | null;
  eventType: WorkflowEventType;
  status: string;
  data: Record<string, unknown>;
  timestamp: Date;
  durationMs: number | null;
}

export type WorkflowEventType =
  | 'WorkflowStarted'
  | 'WorkflowPaused'
  | 'WorkflowResumed'
  | 'WorkflowCancelled'
  | 'WorkflowCompleted'
  | 'WorkflowFailed'
  | 'WorkflowRetried'
  | 'WorkflowStepStarted'
  | 'WorkflowStepCompleted'
  | 'WorkflowStepFailed';

export interface StepResult {
  stepId: string;
  success: boolean;
  output: Record<string, unknown>;
  error: string | null;
  durationMs: number;
  transition: TransitionType;
  retryAttempt: number;
}

export interface WorkflowResult {
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  steps: StepResult[];
  totalDurationMs: number;
  error: string | null;
  context: Record<string, unknown>;
  checkpointCount: number;
}

export interface WorkflowStatistics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  pausedWorkflows: number;
  averageDurationMs: number;
  totalStepsExecuted: number;
  totalRetries: number;
  totalRollbacks: number;
  cacheHitRate: number;
}

export interface WorkflowMetrics {
  workflowName: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  totalRetries: number;
}

export interface CheckpointData {
  workflowId: string;
  stepId: string;
  context: Record<string, unknown>;
  timestamp: Date;
  version: string;
}

export interface WorkflowRuntimeOptions {
  enableCheckpoints?: boolean;
  enableHistory?: boolean;
  enableMetrics?: boolean;
  enableParallelism?: boolean;
  defaultTimeoutMs?: number;
  maxRetriesPerStep?: number;
  maxParallelSteps?: number;
  checkpointIntervalMs?: number;
}
