import type { GenerationResult } from '@storynaram/story-generator';
import type { ExecutionResult } from '@storynaram/narrative-execution';

export interface RevisionOptions {
  passes: RevisionPassType[];
  autoFix: boolean;
  generateReport: boolean;
  maxIterations: number;
  strictMode: boolean;
}

export type RevisionPassType =
  | 'grammar'
  | 'character'
  | 'world'
  | 'timeline'
  | 'canon'
  | 'narrative'
  | 'plot'
  | 'style'
  | 'quality';

export interface RevisionContext {
  sessionId: string;
  generationResult: GenerationResult;
  executionResult?: ExecutionResult;
  abortSignal?: AbortSignal;
  options: RevisionOptions;
}
