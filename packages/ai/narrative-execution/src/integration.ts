import type { PlanningResult } from '@storynaram/narrative-planner';
import type { NarrativeExecutionEngine } from './narrative-execution-engine.js';
import type { ExecutionOptions } from './execution-context.js';

export function executeNarrativePlan(
  engine: NarrativeExecutionEngine,
  plan: PlanningResult,
  options?: Partial<ExecutionOptions>,
  signal?: AbortSignal,
) {
  return engine.execute(plan, options, signal);
}

export class NarrativeExecutionStartedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly planSessionId: string,
  ) {}
}

export class ExecutionStageCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly stage: string,
    public readonly durationMs: number,
    public readonly status: 'completed' | 'failed' | 'skipped',
  ) {}
}

export class NarrativeExecutionCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly totalDurationMs: number,
    public readonly totalTokens: number,
  ) {}
}

export class NarrativeExecutionFailedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly error: string,
  ) {}
}
