export class RevisionStartedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly chapterCount: number,
    public readonly passes: string[],
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
