import { DomainEvent } from '@storynaram/domain-kernel';
import { PlanningContext } from './planning-context.js';
import { PlanningResult } from './planning-result.js';
import { PlanningStatistics } from './planning-statistics.js';
import { DomainType } from '@storynaram/platform';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface SessionCheckpoint {
  id: string;
  sessionId: string;
  stage: string;
  context: PlanningContext;
  status: SessionStatus;
  createdAt: Date;
}

export class PlanningSession {
  public readonly sessionId: string;
  public readonly createdAt: Date;
  public status: SessionStatus = 'idle';
  public context: PlanningContext;
  public result: PlanningResult | null = null;
  public error: string | null = null;
  public currentStage: string | null = null;
  public readonly checkpoints: SessionCheckpoint[] = [];
  public readonly completedStages: string[] = [];
  public readonly events: DomainEvent[] = [];
  private updatedAt: Date;

  constructor(
    sessionId: string,
    context: PlanningContext,
  ) {
    this.sessionId = sessionId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.context = context;
  }

  start(): void {
    this.status = 'running';
    this.updatedAt = new Date();
  }

  pause(): void {
    this.status = 'paused';
    this.updatedAt = new Date();
  }

  resume(): void {
    this.status = 'running';
    this.updatedAt = new Date();
  }

  complete(result: PlanningResult): void {
    this.status = 'completed';
    this.result = result;
    this.updatedAt = new Date();
  }

  fail(error: string): void {
    this.status = 'failed';
    this.error = error;
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = 'cancelled';
    this.updatedAt = new Date();
  }

  setStage(stage: string): void {
    this.currentStage = stage;
    this.completedStages.push(stage);
    this.updatedAt = new Date();
  }

  addEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  createCheckpoint(stage: string): SessionCheckpoint {
    const checkpoint: SessionCheckpoint = {
      id: `cp-${this.sessionId}-${stage}-${Date.now()}`,
      sessionId: this.sessionId,
      stage,
      context: this.context,
      status: this.status,
      createdAt: new Date(),
    };
    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  getLastCheckpoint(): SessionCheckpoint | undefined {
    return this.checkpoints[this.checkpoints.length - 1];
  }

  getElapsedMs(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
