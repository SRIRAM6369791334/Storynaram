import type { ExecutionResult } from '@storynaram/narrative-execution';
import type { AIRuntimeService } from '@storynaram/runtime';

export interface GenerationContext {
  sessionId: string;
  executionResult: ExecutionResult;
  aiRuntime: AIRuntimeService;
  abortSignal?: AbortSignal;
  options: GenerationOptions;
}

export interface GenerationOptions {
  model: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
  stream?: boolean;
  retryCount?: number;
  fallbackModels?: string[];
  fallbackProviders?: string[];
}
