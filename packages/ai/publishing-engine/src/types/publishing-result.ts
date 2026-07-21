import type { PublishingReport } from './publishing-report';
import type { PublishingStatistics } from './publishing-statistics';

export interface RenderedContent {
  format: string;
  content: string;
  size: number;
  chapters: RenderedChapter[];
}

export interface RenderedChapter {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface ExportedFile {
  format: string;
  filename: string;
  content: string;
  size: number;
  mimeType: string;
}

export interface TOCEntry {
  level: number;
  title: string;
  pageReference: string;
  children: TOCEntry[];
}

export class PublishingResult {
  public readonly sessionId: string;
  public readonly storyTitle: string;
  public readonly rendered: RenderedContent[];
  public readonly exported: ExportedFile[];
  public readonly toc: TOCEntry[];
  public readonly publishingReport: PublishingReport;
  public readonly statistics: PublishingStatistics;
  public readonly completedAt: Date;

  constructor(params: {
    sessionId: string;
    storyTitle: string;
    rendered: RenderedContent[];
    exported: ExportedFile[];
    toc: TOCEntry[];
    publishingReport: PublishingReport;
    statistics: PublishingStatistics;
  }) {
    this.sessionId = params.sessionId;
    this.storyTitle = params.storyTitle;
    this.rendered = params.rendered;
    this.exported = params.exported;
    this.toc = params.toc;
    this.publishingReport = params.publishingReport;
    this.statistics = params.statistics;
    this.completedAt = new Date();
  }
}
