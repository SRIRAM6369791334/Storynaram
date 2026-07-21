import type { ExecutionResult } from '@storynaram/narrative-execution';
import type { StoryGenerationEngine } from './story-generation-engine';
import type { GenerationOptions } from './generation-context';

export function generateStory(
  engine: StoryGenerationEngine,
  executionResult: ExecutionResult,
  options?: Partial<GenerationOptions>,
  signal?: AbortSignal,
) {
  return engine.generate(executionResult, options, signal);
}

export class GenerationStartedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly executionSessionId: string,
    public readonly chapterCount: number,
  ) {}
}

export class ChapterGeneratedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly chapterNumber: number,
    public readonly wordCount: number,
    public readonly latencyMs: number,
  ) {}
}

export class GenerationCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly totalChapters: number,
    public readonly totalTokens: number,
    public readonly totalCost: number,
  ) {}
}

export class GenerationFailedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly error: string,
  ) {}
}
