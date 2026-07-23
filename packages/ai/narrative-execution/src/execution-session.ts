import { PlanningResult } from '@storynaram/narrative-planner';
import type { ExecutionContext } from './execution-context.js';
import { ExecutionMemory } from './execution-memory.js';
import type { ExecutionCheckpoint } from './execution-checkpoint.js';
import { ExecutionStatistics } from './execution-statistics.js';

export type ExecutionStatus =
  | 'created'
  | 'initializing'
  | 'building-graph'
  | 'scheduling'
  | 'executing'
  | 'merging'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export class ExecutionSession {
  public readonly sessionId: string;
  public readonly planningResult: PlanningResult;
  public readonly context: ExecutionContext;
  public readonly memory: ExecutionMemory;
  public readonly statistics: ExecutionStatistics;
  public status: ExecutionStatus;
  public checkpoints: ExecutionCheckpoint[] = [];
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt?: Date;
  public error?: string;

  constructor(params: {
    sessionId: string;
    planningResult: PlanningResult;
    context: ExecutionContext;
  }) {
    this.sessionId = params.sessionId;
    this.planningResult = params.planningResult;
    this.context = params.context;
    this.memory = new ExecutionMemory();
    this.statistics = new ExecutionStatistics();
    this.status = 'created';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addCheckpoint(checkpoint: ExecutionCheckpoint): void {
    this.checkpoints.push(checkpoint);
    this.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      error: this.error,
      checkpointCount: this.checkpoints.length,
      memoryRecordCount: this.memory.getHistory().length,
    };
  }
}
