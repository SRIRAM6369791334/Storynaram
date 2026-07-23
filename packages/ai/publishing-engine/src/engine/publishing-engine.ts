import type { RevisionResult, RevisedChapter } from '@storynaram/revision-engine';
import { PublishingSession } from '../types/publishing-session.js';
import type { PublishingStatus } from '../types/publishing-session.js';
import type { PublishingOptions, PublishingProfile, ExportFormat, RenderFormat, PublishingContext } from '../types/publishing-context.js';
import { PublishingPipeline } from '../types/publishing-pipeline.js';
import { PublishingResult, type RenderedContent, type ExportedFile, type TOCEntry } from '../types/publishing-result.js';
import { PublishingStatistics } from '../types/publishing-statistics.js';
import { NovelRenderer } from '../renderers/novel-renderer.js';
import { ScreenplayRenderer } from '../renderers/screenplay-renderer.js';
import { ComicRenderer } from '../renderers/comic-renderer.js';
import { VisualNovelRenderer } from '../renderers/visual-novel-renderer.js';
import { InteractiveFictionRenderer } from '../renderers/interactive-fiction-renderer.js';
import { MarkdownRenderer } from '../renderers/markdown-renderer.js';
import { HTMLRenderer } from '../renderers/html-renderer.js';
import { JSONRenderer } from '../renderers/json-renderer.js';
import { Renderer, type RendererResult } from '../renderers/renderer.js';
import { PDFExporter } from '../exporters/pdf-exporter.js';
import { EPUBExporter } from '../exporters/epub-exporter.js';
import { DOCXExporter } from '../exporters/docx-exporter.js';
import { MarkdownExporter } from '../exporters/markdown-exporter.js';
import { HTMLExporter } from '../exporters/html-exporter.js';
import { JSONExporter } from '../exporters/json-exporter.js';
import { TXTExporter } from '../exporters/txt-exporter.js';
import { ZIPExporter } from '../exporters/zip-exporter.js';
import { Exporter, type ExportResult } from '../exporters/exporter.js';
import { TOCGenerator } from '../toc/toc-generator.js';
import { MetadataGenerator, type MetadataInput } from '../metadata/metadata-generator.js';
import { CoverGenerator } from '../cover/cover-generator.js';
import { AssetPackager } from '../assets/asset-packager.js';
import { PublishingProfileManager } from '../profiles/publishing-profile.js';
import { PackageValidator } from '../validation/package-validator.js';

export interface EngineOptions {
  defaultProfile?: PublishingProfile;
  defaultExportFormats?: ExportFormat[];
  author?: string;
  publisher?: string;
}

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeSessions: number;
  totalPublications: number;
  failedPublications: number;
}

const RENDERERS: Record<string, Renderer> = {
  novel: new NovelRenderer(),
  screenplay: new ScreenplayRenderer(),
  comic: new ComicRenderer(),
  'visual-novel': new VisualNovelRenderer(),
  'interactive-fiction': new InteractiveFictionRenderer(),
  markdown: new MarkdownRenderer(),
  html: new HTMLRenderer(),
  json: new JSONRenderer(),
};

const EXPORTERS: Record<string, Exporter> = {
  pdf: new PDFExporter(),
  epub: new EPUBExporter(),
  docx: new DOCXExporter(),
  markdown: new MarkdownExporter(),
  html: new HTMLExporter(),
  json: new JSONExporter(),
  txt: new TXTExporter(),
  zip: new ZIPExporter(),
};

export class PublishingEngine {
  private activeSessions: Map<string, PublishingSession> = new Map();
  private totalPublications: number = 0;
  private failedPublications: number = 0;
  private readonly options: EngineOptions;

  private profileManager = new PublishingProfileManager();
  private tocGenerator = new TOCGenerator();
  private metadataGenerator = new MetadataGenerator();
  private coverGenerator = new CoverGenerator();
  private assetPackager = new AssetPackager();
  private validator = new PackageValidator();

  constructor(options?: Partial<EngineOptions>) {
    this.options = {
      defaultProfile: options?.defaultProfile ?? 'novel',
      defaultExportFormats: options?.defaultExportFormats,
      author: options?.author ?? 'Unknown Author',
      publisher: options?.publisher ?? 'Self-Published',
    };
  }

  async publish(
    revisionResult: RevisionResult,
    userOptions?: Partial<PublishingOptions>,
    signal?: AbortSignal,
  ): Promise<PublishingResult> {
    const sessionId = crypto.randomUUID();
    const profile = userOptions?.profile ?? this.options.defaultProfile ?? 'novel';
    const profileDef = this.profileManager.getProfile(profile);

    const renderFormat: RenderFormat = (userOptions?.renderFormat ?? profileDef.renderFormat) as RenderFormat;
    const exportFormats: ExportFormat[] = userOptions?.exportFormats ?? this.options.defaultExportFormats ?? profileDef.defaultExportFormats as ExportFormat[];

    const options: PublishingOptions = {
      profile,
      renderFormat,
      exportFormats,
      includeToc: userOptions?.includeToc ?? true,
      includeMetadata: userOptions?.includeMetadata ?? true,
      includeCover: userOptions?.includeCover ?? true,
      includeAssets: userOptions?.includeAssets ?? true,
      includeIndexes: userOptions?.includeIndexes ?? true,
      pageSize: userOptions?.pageSize ?? profileDef.pageSize,
      fontSize: userOptions?.fontSize ?? profileDef.fontSize,
      lineHeight: userOptions?.lineHeight ?? profileDef.lineHeight,
      margins: userOptions?.margins ?? profileDef.margins,
    };

    const context: PublishingContext = {
      sessionId,
      revisionResult,
      abortSignal: signal,
      options,
    };

    const session = new PublishingSession({ sessionId, revisionResult, context });
    this.activeSessions.set(sessionId, session);
    this.totalPublications++;

    signal?.throwIfAborted();

    const pipeline = new PublishingPipeline();
    pipeline.addStage('select-profile');
    pipeline.addStage('render');
    pipeline.addStage('generate-toc');
    pipeline.addStage('generate-metadata');
    pipeline.addStage('generate-cover');
    pipeline.addStage('package-assets');
    pipeline.addStage('export');
    pipeline.addStage('validate');
    pipeline.addStage('generate-reports');

    try {
      const chapters = revisionResult.chapters.map(ch => ({
        number: ch.number,
        title: ch.originalTitle,
        content: ch.revisedContent,
      }));

      session.statistics.start();

      session.status = 'selecting-profile';
      pipeline.startStage('select-profile');
      pipeline.completeStage('select-profile');

      signal?.throwIfAborted();

      session.status = 'rendering';
      pipeline.startStage('render');
      const rendered = this.renderContent(renderFormat, chapters);
      pipeline.completeStage('render', rendered.reduce((s, r) => s + r.size, 0));
      session.memory.storeRendered(renderFormat, rendered[0]?.content ?? '');

      session.status = 'generating-toc';
      pipeline.startStage('generate-toc');
      const tocEntries = this.tocGenerator.generateTOC(chapters);
      const tocCount = this.tocGenerator.countTOCEntries(chapters);
      session.statistics.setTocEntryCount(tocCount);
      pipeline.completeStage('generate-toc');

      session.status = 'generating-metadata';
      pipeline.startStage('generate-metadata');
      const metadata = this.metadataGenerator.generate({
        title: revisionResult.storyTitle,
        author: this.options.author,
        publisher: this.options.publisher,
      });
      pipeline.completeStage('generate-metadata');

      session.status = 'packaging-assets';
      pipeline.startStage('package-assets');
      const assetFiles = this.assetPackager.packageAssets(revisionResult.storyTitle, chapters);
      pipeline.completeStage('package-assets');

      signal?.throwIfAborted();

      session.status = 'exporting';
      pipeline.startStage('export');
      const exported = this.exportContent(exportFormats, rendered, revisionResult, tocEntries, metadata);
      for (const file of exported) {
        session.memory.storeExported(file.format, file.content);
      }
      pipeline.completeStage('export');

      session.status = 'validating';
      pipeline.startStage('validate');
      const validation = this.validator.validate({
        chapters,
        renderedFormats: rendered.map(r => r.format),
        exportedFormats: exported.map(e => e.format),
        tocEntries: tocCount,
        metadataPresent: true,
      });
      pipeline.completeStage('validate');

      session.status = 'generating-reports';
      pipeline.startStage('generate-reports');
      const report = this.buildReport(rendered, exported, validation);
      pipeline.completeStage('generate-reports');

      session.status = 'completed';
      session.completedAt = new Date();

      const result = new PublishingResult({
        sessionId,
        storyTitle: revisionResult.storyTitle,
        rendered,
        exported,
        toc: tocEntries,
        publishingReport: report,
        statistics: session.statistics,
      });

      this.activeSessions.delete(sessionId);
      return result;
    } catch (error) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : String(error);
      session.completedAt = new Date();
      this.failedPublications++;
      this.activeSessions.delete(sessionId);
      throw error;
    }
  }

  private renderContent(
    renderFormat: RenderFormat,
    chapters: Array<{ number: number; title: string; content: string }>,
  ): RenderedContent[] {
    const renderer = RENDERERS[renderFormat];
    if (!renderer) {
      throw new Error(`Unknown render format: ${renderFormat}`);
    }

    const result = renderer.render(chapters);
    return [{
      format: result.format,
      content: result.content,
      size: result.size,
      chapters: result.chapters,
    }];
  }

  private exportContent(
    exportFormats: ExportFormat[],
    rendered: RenderedContent[],
    revisionResult: RevisionResult,
    toc: TOCEntry[],
    metadata: import('../types/publishing-report').MetadataPackage,
  ): ExportedFile[] {
    const files: ExportedFile[] = [];
    const mainContent = rendered[0]?.content ?? '';

    for (const format of exportFormats) {
      const exporter = EXPORTERS[format];
      if (!exporter) continue;

      let content = mainContent;
      if (format === 'html' || format === 'markdown' || format === 'json') {
        const tocText = this.tocGenerator.generateBookTOC(
          revisionResult.chapters.map(ch => ({ number: ch.number, title: ch.originalTitle }))
        );
        const coverText = this.coverGenerator.generateCoverText({
          title: metadata.title,
          subtitle: metadata.subtitle,
          author: metadata.author,
        });
        content = `${coverText}\n\n${tocText}\n\n${mainContent}`;
      }

      const result = exporter.export(content, revisionResult.storyTitle);
      sessionStatTrack(exportFormats.length, result.size);

      files.push({
        format: result.format,
        filename: result.filename,
        content: result.content,
        size: result.size,
        mimeType: result.mimeType,
      });
    }

    return files;
  }

  private buildReport(
    rendered: RenderedContent[],
    exported: ExportedFile[],
    validation: import('../types/publishing-report').ValidationReport,
  ): import('../types/publishing-report').PublishingReport {
    return {
      summary: `Published ${rendered.length} format(s) and exported ${exported.length} file(s)`,
      passed: validation.passed,
      rendered: rendered.map(r => ({
        format: r.format,
        status: 'success' as const,
        size: r.size,
        durationMs: 0,
      })),
      exported: exported.map(e => ({
        format: e.format,
        status: 'success' as const,
        size: e.size,
        durationMs: 0,
      })),
      validation,
      metadata: {
        title: '',
        author: '',
        language: 'en',
        genre: [],
        tags: [],
        description: '',
        keywords: [],
        version: '1.0.0',
        revision: '1',
        copyright: '',
        license: 'All Rights Reserved',
        publisher: '',
        publicationDate: new Date().toISOString().split('T')[0] ?? '',
      },
    };
  }

  getHealth(): EngineHealth {
    return {
      status: this.failedPublications > this.totalPublications * 0.5 ? 'degraded' : 'healthy',
      activeSessions: this.activeSessions.size,
      totalPublications: this.totalPublications,
      failedPublications: this.failedPublications,
    };
  }

  getSession(sessionId: string): PublishingSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

let sessionTotalSize = 0;
let sessionFormatCount = 0;
function sessionStatTrack(formatCount: number, size: number): void {
  sessionFormatCount = formatCount;
  sessionTotalSize += size;
}
