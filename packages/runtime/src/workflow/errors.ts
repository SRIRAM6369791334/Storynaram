import { EntityRuntimeError } from '../errors';

export class WorkflowError extends EntityRuntimeError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'WorkflowError';
  }
}

export class WorkflowExecutionError extends WorkflowError {
  constructor(workflowId: string, stepId: string, reason: string) {
    super(`Workflow ${workflowId} step ${stepId} failed: ${reason}`, 'WORKFLOW_EXECUTION_ERROR');
    this.name = 'WorkflowExecutionError';
  }
}

export class WorkflowStateError extends WorkflowError {
  constructor(workflowId: string, fromState: string, toState: string) {
    super(`Invalid state transition for workflow ${workflowId}: ${fromState} -> ${toState}`, 'WORKFLOW_STATE_ERROR');
    this.name = 'WorkflowStateError';
  }
}

export class WorkflowTimeoutError extends WorkflowError {
  constructor(workflowId: string, stepId: string, timeoutMs: number) {
    super(`Workflow ${workflowId} step ${stepId} timed out after ${String(timeoutMs)}ms`, 'WORKFLOW_TIMEOUT');
    this.name = 'WorkflowTimeoutError';
  }
}

export class WorkflowRollbackError extends WorkflowError {
  constructor(workflowId: string, stepId: string, reason: string) {
    super(`Workflow ${workflowId} rollback failed at step ${stepId}: ${reason}`, 'WORKFLOW_ROLLBACK_ERROR');
    this.name = 'WorkflowRollbackError';
  }
}

export class WorkflowCheckpointError extends WorkflowError {
  constructor(workflowId: string, reason: string) {
    super(`Workflow ${workflowId} checkpoint error: ${reason}`, 'WORKFLOW_CHECKPOINT_ERROR');
    this.name = 'WorkflowCheckpointError';
  }
}
