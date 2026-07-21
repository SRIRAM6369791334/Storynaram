import { Module, Global, type DynamicModule } from '@nestjs/common';
import { PublishingEngine, type EngineOptions } from '../engine/publishing-engine';
import { TOCGenerator } from '../toc/toc-generator';
import { MetadataGenerator } from '../metadata/metadata-generator';
import { CoverGenerator } from '../cover/cover-generator';
import { AssetPackager } from '../assets/asset-packager';
import { PublishingProfileManager } from '../profiles/publishing-profile';
import { PackageValidator } from '../validation/package-validator';
import { NovelRenderer } from '../renderers/novel-renderer';
import { ScreenplayRenderer } from '../renderers/screenplay-renderer';
import { ComicRenderer } from '../renderers/comic-renderer';
import { VisualNovelRenderer } from '../renderers/visual-novel-renderer';
import { InteractiveFictionRenderer } from '../renderers/interactive-fiction-renderer';
import { MarkdownRenderer } from '../renderers/markdown-renderer';
import { HTMLRenderer } from '../renderers/html-renderer';
import { JSONRenderer } from '../renderers/json-renderer';
import { PDFExporter } from '../exporters/pdf-exporter';
import { EPUBExporter } from '../exporters/epub-exporter';
import { DOCXExporter } from '../exporters/docx-exporter';
import { MarkdownExporter } from '../exporters/markdown-exporter';
import { HTMLExporter } from '../exporters/html-exporter';
import { JSONExporter } from '../exporters/json-exporter';
import { TXTExporter } from '../exporters/txt-exporter';
import { ZIPExporter } from '../exporters/zip-exporter';

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
