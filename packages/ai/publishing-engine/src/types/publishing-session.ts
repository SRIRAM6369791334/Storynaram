import type { RevisionResult } from '@storynaram/revision-engine';
import type { PublishingContext } from './publishing-context.js';
import { PublishingMemory } from './publishing-memory.js';
import { PublishingStatistics } from './publishing-statistics.js';

export type PublishingStatus = 'created' | 'loading' | 'selecting-profile' | 'rendering' | 'generating-toc' | 'generating-metadata' | 'packaging-assets' | 'exporting' | 'validating' | 'generating-reports' | 'completed' | 'failed' | 'cancelled';

export class PublishingSession {
  public readonly sessionId: string;
  public readonly revisionResult: RevisionResult;
  public readonly context: PublishingContext;
  public readonly memory: PublishingMemory;
  public readonly statistics: PublishingStatistics;
  public status: PublishingStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt?: Date;
  public error?: string;

  constructor(params: {
    sessionId: string;
    revisionResult: RevisionResult;
    context: PublishingContext;
  }) {
    this.sessionId = params.sessionId;
    this.revisionResult = params.revisionResult;
    this.context = params.context;
    this.memory = new PublishingMemory();
    this.statistics = new PublishingStatistics();
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
      chapterCount: this.revisionResult.chapters.length,
    };
  }
}
