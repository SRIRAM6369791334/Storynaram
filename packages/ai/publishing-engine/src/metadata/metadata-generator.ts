import type { MetadataPackage, CoverMetadata } from '../types/publishing-report';
import type { TOCEntry } from '../types/publishing-result';

export interface MetadataInput {
  title: string;
  subtitle?: string;
  author?: string;
  language?: string;
  genre?: string[];
  tags?: string[];
  description?: string;
  keywords?: string[];
  version?: string;
  revision?: string;
  copyright?: string;
  license?: string;
  isbn?: string;
  publisher?: string;
  series?: string;
  volume?: number;
}

export class MetadataGenerator {
  generate(input: MetadataInput): MetadataPackage {
    return {
      title: input.title,
      subtitle: input.subtitle,
      author: input.author ?? 'Unknown Author',
      language: input.language ?? 'en',
      genre: input.genre ?? [],
      tags: input.tags ?? [],
      description: input.description ?? '',
      keywords: input.keywords ?? [],
      version: input.version ?? '1.0.0',
      revision: input.revision ?? '1',
      copyright: input.copyright ?? `© ${new Date().getFullYear()} ${input.author ?? 'Unknown Author'}`,
      license: input.license ?? 'All Rights Reserved',
      isbn: input.isbn,
      publisher: input.publisher ?? 'Self-Published',
      publicationDate: new Date().toISOString().split('T')[0]!,
      series: input.series,
      volume: input.volume,
    };
  }

  generateCover(input: MetadataInput): CoverMetadata {
    return {
      title: input.title,
      subtitle: input.subtitle,
      author: input.author ?? 'Unknown Author',
      series: input.series,
      volume: input.volume,
      backCover: `${input.description?.slice(0, 200) ?? ''}`,
      spine: input.series ? `${input.series} · ${input.title}` : input.title,
    };
  }

  generateHTMLMetadata(metadata: MetadataPackage): string {
    const lines: string[] = [];
    lines.push('<meta name="title" content="' + this.escapeAttr(metadata.title) + '">');
    if (metadata.subtitle) lines.push('<meta name="subtitle" content="' + this.escapeAttr(metadata.subtitle) + '">');
    lines.push('<meta name="author" content="' + this.escapeAttr(metadata.author) + '">');
    lines.push('<meta name="language" content="' + this.escapeAttr(metadata.language) + '">');
    lines.push('<meta name="description" content="' + this.escapeAttr(metadata.description) + '">');
    lines.push('<meta name="keywords" content="' + this.escapeAttr(metadata.keywords.join(', ')) + '">');
    lines.push('<meta name="generator" content="Storynaram Publishing Engine">');
    return lines.join('\n');
  }

  generateJSONMetadata(metadata: MetadataPackage): string {
    return JSON.stringify(metadata, null, 2);
  }

  private escapeAttr(text: string): string {
    return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
