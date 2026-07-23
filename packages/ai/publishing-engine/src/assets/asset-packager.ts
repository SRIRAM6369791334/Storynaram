import type { ExportedFile } from '../types/publishing-result.js';

export interface AssetManifest {
  images: AssetEntry[];
  illustrations: AssetEntry[];
  maps: AssetEntry[];
  characterSheets: AssetEntry[];
  worldMaps: AssetEntry[];
  appendices: AssetEntry[];
  glossary: AssetEntry[];
}

export interface AssetEntry {
  name: string;
  type: string;
  description: string;
  size: number;
}

export class AssetPackager {
  generateAssetManifest(title: string): AssetManifest {
    return {
      images: [],
      illustrations: [],
      maps: [],
      characterSheets: [],
      worldMaps: [],
      appendices: [],
      glossary: [],
    };
  }

  generateGlossary(chapters: Array<{ number: number; title: string; content: string }>): string {
    const terms = new Map<string, string>();
    const patterns = [
      /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s(?:is|was|refers to|means|known as)\s"([^"]+)"/g,
    ];

    for (const chapter of chapters) {
      for (const pattern of patterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(chapter.content)) !== null) {
          terms.set(match[1]!, match[2]!);
        }
      }
    }

    if (terms.size === 0) return '';

    const lines: string[] = ['# Glossary', ''];
    for (const [term, definition] of terms) {
      lines.push(`**${term}**: ${definition}`);
    }

    return lines.join('\n');
  }

  generateAppendix(name: string, content: string): string {
    return `# ${name}\n\n${content}`;
  }

  packageAssets(
    title: string,
    chapters: Array<{ number: number; title: string; content: string }>,
  ): ExportedFile[] {
    const files: ExportedFile[] = [];

    const glossary = this.generateGlossary(chapters);
    if (glossary) {
      files.push({
        format: 'markdown',
        filename: `glossary.md`,
        content: glossary,
        size: glossary.length,
        mimeType: 'text/markdown',
      });
    }

    const manifest = this.generateAssetManifest(title);
    const manifestJson = JSON.stringify(manifest, null, 2);
    files.push({
      format: 'json',
      filename: 'asset-manifest.json',
      content: manifestJson,
      size: manifestJson.length,
      mimeType: 'application/json',
    });

    return files;
  }
}
