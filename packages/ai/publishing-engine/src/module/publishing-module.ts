import { Module, Global, type DynamicModule } from '@nestjs/common';
import { PublishingEngine, type EngineOptions } from '../engine/publishing-engine.js';
import { TOCGenerator } from '../toc/toc-generator.js';
import { MetadataGenerator } from '../metadata/metadata-generator.js';
import { CoverGenerator } from '../cover/cover-generator.js';
import { AssetPackager } from '../assets/asset-packager.js';
import { PublishingProfileManager } from '../profiles/publishing-profile.js';
import { PackageValidator } from '../validation/package-validator.js';
import { NovelRenderer } from '../renderers/novel-renderer.js';
import { ScreenplayRenderer } from '../renderers/screenplay-renderer.js';
import { ComicRenderer } from '../renderers/comic-renderer.js';
import { VisualNovelRenderer } from '../renderers/visual-novel-renderer.js';
import { InteractiveFictionRenderer } from '../renderers/interactive-fiction-renderer.js';
import { MarkdownRenderer } from '../renderers/markdown-renderer.js';
import { HTMLRenderer } from '../renderers/html-renderer.js';
import { JSONRenderer } from '../renderers/json-renderer.js';
import { PDFExporter } from '../exporters/pdf-exporter.js';
import { EPUBExporter } from '../exporters/epub-exporter.js';
import { DOCXExporter } from '../exporters/docx-exporter.js';
import { MarkdownExporter } from '../exporters/markdown-exporter.js';
import { HTMLExporter } from '../exporters/html-exporter.js';
import { JSONExporter } from '../exporters/json-exporter.js';
import { TXTExporter } from '../exporters/txt-exporter.js';
import { ZIPExporter } from '../exporters/zip-exporter.js';

export interface PublishingModuleOptions {
  engine?: Partial<EngineOptions>;
  isGlobal?: boolean;
}

@Global()
@Module({})
export class PublishingModule {
  static forRoot(options?: PublishingModuleOptions): DynamicModule {
    return {
      module: PublishingModule,
      global: options?.isGlobal ?? true,
      providers: [
        {
          provide: PublishingEngine,
          useFactory: () => new PublishingEngine(options?.engine),
        },
        TOCGenerator, MetadataGenerator, CoverGenerator, AssetPackager,
        PublishingProfileManager, PackageValidator,
        NovelRenderer, ScreenplayRenderer, ComicRenderer, VisualNovelRenderer,
        InteractiveFictionRenderer, MarkdownRenderer, HTMLRenderer, JSONRenderer,
        PDFExporter, EPUBExporter, DOCXExporter, MarkdownExporter,
        HTMLExporter, JSONExporter, TXTExporter, ZIPExporter,
      ],
      exports: [PublishingEngine],
    };
  }

  static forFeature(options?: PublishingModuleOptions): DynamicModule {
    return {
      module: PublishingModule,
      providers: [
        {
          provide: PublishingEngine,
          useFactory: () => new PublishingEngine(options?.engine),
        },
        TOCGenerator, MetadataGenerator, CoverGenerator, AssetPackager,
        PublishingProfileManager, PackageValidator,
        NovelRenderer, ScreenplayRenderer, ComicRenderer, VisualNovelRenderer,
        InteractiveFictionRenderer, MarkdownRenderer, HTMLRenderer, JSONRenderer,
        PDFExporter, EPUBExporter, DOCXExporter, MarkdownExporter,
        HTMLExporter, JSONExporter, TXTExporter, ZIPExporter,
      ],
      exports: [PublishingEngine],
    };
  }
}
