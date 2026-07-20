export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export class WorkflowExecutionError extends WorkflowError {
  constructor(workflowId: string, stepId: string, reason: string) {
    super(`Workflow ${workflowId} step ${stepId} failed: ${reason}`);
    this.name = 'WorkflowExecutionError';
  }
}

export class WorkflowStateError extends WorkflowError {
  constructor(workflowId: string, fromState: string, toState: string) {
    super(`Invalid state transition for workflow ${workflowId}: ${fromState} -> ${toState}`);
    this.name = 'WorkflowStateError';
  }
}

export class WorkflowTimeoutError extends WorkflowError {
  constructor(workflowId: string, stepId: string, timeoutMs: number) {
    super(`Workflow ${workflowId} step ${stepId} timed out after ${String(timeoutMs)}ms`);
    this.name = 'WorkflowTimeoutError';
  }
}

export class WorkflowRollbackError extends WorkflowError {
  constructor(workflowId: string, stepId: string, reason: string) {
    super(`Workflow ${workflowId} rollback failed at step ${stepId}: ${reason}`);
    this.name = 'WorkflowRollbackError';
  }
}

export class WorkflowCheckpointError extends WorkflowError {
  constructor(workflowId: string, reason: string) {
    super(`Workflow ${workflowId} checkpoint error: ${reason}`);
    this.name = 'WorkflowCheckpointError';
  }
}
