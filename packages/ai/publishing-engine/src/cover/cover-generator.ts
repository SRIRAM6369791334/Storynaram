import type { CoverMetadata } from '../types/publishing-report';

export class CoverGenerator {
  generateCoverText(metadata: CoverMetadata): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`  ${metadata.title.toUpperCase()}`);
    if (metadata.subtitle) {
      lines.push(`  ${metadata.subtitle}`);
    }
    lines.push('');
    lines.push(`  by ${metadata.author}`);
    lines.push('');
    if (metadata.series) {
      lines.push(`  ${metadata.series}${metadata.volume ? ` · Volume ${metadata.volume}` : ''}`);
      lines.push('');
    }
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  generateBackCoverText(metadata: CoverMetadata): string {
    const lines: string[] = [];

    lines.push('-'.repeat(60));
    lines.push('');
    if (metadata.backCover) {
      lines.push(`  ${metadata.backCover}`);
    }
    lines.push('');
    lines.push(`  Author: ${metadata.author}`);
    lines.push('-'.repeat(60));

    return lines.join('\n');
  }

  generateSpineText(metadata: CoverMetadata): string {
    const text = metadata.spine ?? metadata.title;
    return text.length > 20 ? text.slice(0, 20) : text;
  }

  generateHTMLCover(metadata: CoverMetadata): string {
    return `<!DOCTYPE html>
<html lang="en">
<head><title>${metadata.title}</title>
<style>
body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; }
.cover { width: 400px; padding: 3em; background: linear-gradient(135deg, #16213e, #0f3460); color: #e94560; text-align: center; font-family: Georgia, serif; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
h1 { font-size: 2em; margin-bottom: 0.5em; color: #fff; }
.subtitle { font-style: italic; color: #ccc; margin-bottom: 1.5em; }
.author { font-size: 1.2em; color: #e94560; }
.series { color: #888; font-size: 0.9em; margin-top: 2em; }
</style></head>
<body>
<div class="cover">
<h1>${metadata.title}</h1>
${metadata.subtitle ? `<div class="subtitle">${metadata.subtitle}</div>` : ''}
<div class="author">${metadata.author}</div>
${metadata.series ? `<div class="series">${metadata.series}${metadata.volume ? ' · Vol. ' + metadata.volume : ''}</div>` : ''}
</div>
</body></html>`;
  }

  generateCoverMetadataXML(metadata: CoverMetadata): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cover>
  <title>${metadata.title}</title>
  ${metadata.subtitle ? `<subtitle>${metadata.subtitle}</subtitle>` : ''}
  <author>${metadata.author}</author>
  ${metadata.series ? `<series>${metadata.series}</series>` : ''}
  ${metadata.volume ? `<volume>${metadata.volume}</volume>` : ''}
</cover>`;
  }
}
