import type { PlanningResult } from '@storynaram/narrative-planner';
import type { AIRuntimeService } from '@storynaram/runtime';

export interface ExecutionContext {
  sessionId: string;
  planningResult: PlanningResult;
  aiRuntime: AIRuntimeService;
  abortSignal?: AbortSignal;
  options: ExecutionOptions;
}

export interface ExecutionOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  parallel?: boolean;
}
