import type { GenerationResult } from '@storynaram/story-generator';
import type { ExecutionResult } from '@storynaram/narrative-execution';
import type { RevisionEngine } from './engine/revision-engine';
import type { RevisionOptions, RevisionPassType } from './types/revision-context';

export function reviseStory(
  engine: RevisionEngine,
  generationResult: GenerationResult,
  executionResult?: ExecutionResult,
  options?: Partial<RevisionOptions>,
  signal?: AbortSignal,
) {
  return engine.revise(generationResult, executionResult, options, signal);
}

export class RevisionStartedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly chapterCount: number,
    public readonly passes: RevisionPassType[],
  ) {}
}

export class RevisionPassCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly passName: string,
    public readonly issuesFound: number,
    public readonly issuesResolved: number,
    public readonly durationMs: number,
    public readonly passed: boolean,
  ) {}
}

export class IssueDetectedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly issueId: string,
    public readonly type: string,
    public readonly severity: string,
    public readonly chapterNumber: number,
    public readonly description: string,
  ) {}
}

export class IssueResolvedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly issueId: string,
  ) {}
}

export class QualityImprovedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly scoreBefore: number,
    public readonly scoreAfter: number,
    public readonly improvement: number,
  ) {}
}

export class RevisionCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly totalChapters: number,
    public readonly totalIssuesFound: number,
    public readonly totalIssuesResolved: number,
    public readonly overallQualityBefore: number,
    public readonly overallQualityAfter: number,
  ) {}
}
