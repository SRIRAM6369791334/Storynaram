import type { GenerationResult } from '@storynaram/story-generator';
import type { RevisionContext } from './revision-context.js';
import { RevisionMemory } from './revision-memory.js';
import { RevisionStatistics } from './revision-statistics.js';

export type RevisionStatus = 'created' | 'analyzing' | 'detecting' | 'running-passes' | 'applying-fixes' | 'validating' | 'generating-reports' | 'completed' | 'failed' | 'cancelled';

export class RevisionSession {
  public readonly sessionId: string;
  public readonly generationResult: GenerationResult;
  public readonly context: RevisionContext;
  public readonly memory: RevisionMemory;
  public readonly statistics: RevisionStatistics;
  public status: RevisionStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt?: Date;
  public error?: string;

  constructor(params: {
    sessionId: string;
    generationResult: GenerationResult;
    context: RevisionContext;
  }) {
    this.sessionId = params.sessionId;
    this.generationResult = params.generationResult;
    this.context = params.context;
    this.memory = new RevisionMemory();
    this.statistics = new RevisionStatistics();
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
      chapterCount: this.generationResult.chapters.length,
    };
  }
}
