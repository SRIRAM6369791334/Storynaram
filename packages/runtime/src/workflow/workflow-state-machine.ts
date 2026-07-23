import { Injectable, Logger } from '@nestjs/common';
import type { WorkflowStatus, TransitionType } from './types.js';
import { WorkflowStateError } from './errors.js';

const VALID_TRANSITIONS: Record<WorkflowStatus, Partial<Record<TransitionType, WorkflowStatus>>> = {
  Created: { success: 'Ready' },
  Ready: { success: 'Running' },
  Running: {
    success: 'Completed',
    failure: 'Failed',
    retry: 'Retrying',
    timeout: 'TimedOut',
    cancel: 'Cancelled',
    skip: 'Completed',
  },
  Paused: { success: 'Running' },
  Waiting: { success: 'Running' },
  Completed: {},
  Failed: { rollback: 'RolledBack' },
  Cancelled: {},
  Retrying: { success: 'Running', failure: 'Failed', timeout: 'TimedOut' },
  TimedOut: { rollback: 'RolledBack' },
  RolledBack: {},
  Archived: {},
};

export interface StateTransition {
  from: WorkflowStatus;
  to: WorkflowStatus;
  via: TransitionType;
}

@Injectable()
export class WorkflowStateMachine {
  private readonly logger = new Logger(WorkflowStateMachine.name);

  canTransition(from: WorkflowStatus, via: TransitionType): boolean {
    const transitions = VALID_TRANSITIONS[from];
    if (!transitions) return false;
    return transitions[via] !== undefined;
  }

  getNextStatus(from: WorkflowStatus, via: TransitionType): WorkflowStatus | undefined {
    const transitions = VALID_TRANSITIONS[from];
    if (!transitions) return undefined;
    return transitions[via];
  }

  transition(from: WorkflowStatus, via: TransitionType): WorkflowStatus {
    const next = this.getNextStatus(from, via);
    if (!next) {
      throw new WorkflowStateError('workflow', from, via);
    }
    this.logger.debug(`State transition: ${from} --[${via}]--> ${next}`);
    return next;
  }

  isValidStatus(status: string): status is WorkflowStatus {
    return VALID_TRANSITIONS[status as WorkflowStatus] !== undefined;
  }

  isTerminal(status: WorkflowStatus): boolean {
    return ['Completed', 'Failed', 'Cancelled', 'TimedOut', 'RolledBack', 'Archived'].includes(status);
  }

  isActive(status: WorkflowStatus): boolean {
    return ['Ready', 'Running', 'Paused', 'Waiting', 'Retrying'].includes(status);
  }

  getValidTransitions(from: WorkflowStatus): TransitionType[] {
    const transitions = VALID_TRANSITIONS[from];
    if (!transitions) return [];
    return Object.keys(transitions) as TransitionType[];
  }
}
