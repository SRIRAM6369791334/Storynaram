import type { RevisionReport } from './revision-report.js';
import type { RevisionStatistics } from './revision-statistics.js';

export interface RevisedChapter {
  number: number;
  originalTitle: string;
  originalContent: string;
  revisedContent: string;
  changes: number;
  issuesFound: number;
  issuesResolved: number;
  qualityImprovement: number;
}

export class RevisionResult {
  public readonly sessionId: string;
  public readonly storyTitle: string;
  public readonly originalFullStory: string;
  public readonly revisedFullStory: string;
  public readonly chapters: RevisedChapter[];
  public readonly revisionReport: RevisionReport;
  public readonly statistics: RevisionStatistics;
  public readonly completedAt: Date;

  constructor(params: {
    sessionId: string;
    storyTitle: string;
    originalFullStory: string;
    revisedFullStory: string;
    chapters: RevisedChapter[];
    revisionReport: RevisionReport;
    statistics: RevisionStatistics;
  }) {
    this.sessionId = params.sessionId;
    this.storyTitle = params.storyTitle;
    this.originalFullStory = params.originalFullStory;
    this.revisedFullStory = params.revisedFullStory;
    this.chapters = params.chapters;
    this.revisionReport = params.revisionReport;
    this.statistics = params.statistics;
    this.completedAt = new Date();
  }
}
