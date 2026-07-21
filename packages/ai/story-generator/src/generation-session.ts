import type { ExecutionResult } from '@storynaram/narrative-execution';
import type { GenerationContext } from './generation-context';
import { GenerationMemory } from './generation-memory';
import { GenerationStatistics } from './generation-statistics';

export type GenerationStatus = 'created' | 'building-context' | 'assembling-prompts' | 'generating' | 'streaming' | 'assembling' | 'validating' | 'completed' | 'failed' | 'cancelled';

export class GenerationSession {
  public readonly sessionId: string;
  public readonly executionResult: ExecutionResult;
  public readonly context: GenerationContext;
  public readonly memory: GenerationMemory;
  public readonly statistics: GenerationStatistics;
  public status: GenerationStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt?: Date;
  public error?: string;

  constructor(params: {
    sessionId: string;
    executionResult: ExecutionResult;
    context: GenerationContext;
  }) {
    this.sessionId = params.sessionId;
    this.executionResult = params.executionResult;
    this.context = params.context;
    this.memory = new GenerationMemory();
    this.statistics = new GenerationStatistics();
    this.status = 'created';
    this.createdAt = new Date();
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
      chapterCount: this.executionResult.storyDraft.chapters.length,
    };
  }
}
