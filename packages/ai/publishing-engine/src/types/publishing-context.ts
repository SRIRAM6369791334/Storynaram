import type { RevisionResult } from '@storynaram/revision-engine';

export type PublishingProfile = 'novel' | 'light-novel' | 'comic' | 'manga' | 'visual-novel' | 'screenplay' | 'interactive-fiction' | 'game-script';

export type ExportFormat = 'pdf' | 'epub' | 'docx' | 'markdown' | 'html' | 'json' | 'txt' | 'zip';

export type RenderFormat = 'novel' | 'screenplay' | 'comic' | 'visual-novel' | 'interactive-fiction' | 'markdown' | 'html' | 'json';

export interface PublishingOptions {
  profile: PublishingProfile;
  renderFormat: RenderFormat;
  exportFormats: ExportFormat[];
  includeToc: boolean;
  includeMetadata: boolean;
  includeCover: boolean;
  includeAssets: boolean;
  includeIndexes: boolean;
  pageSize: string;
  fontSize: number;
  lineHeight: number;
  margins: { top: number; bottom: number; left: number; right: number };
}

export interface PublishingContext {
  sessionId: string;
  revisionResult: RevisionResult;
  abortSignal?: AbortSignal;
  options: PublishingOptions;
}
