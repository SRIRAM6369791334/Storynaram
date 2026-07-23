import { Exporter, type ExportResult } from './exporter.js';
import type { ExportFormat } from '../types/publishing-context.js';

export class HTMLExporter extends Exporter {
  readonly format: ExportFormat = 'html';
  readonly mimeType = 'text/html';
  readonly extension = '.html';

  export(content: string, title: string): ExportResult {
    const wrapped = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${this.escapeHtml(title)}</title>
<style>
body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2em; line-height: 1.6; }
h1 { text-align: center; }
p { text-indent: 1.5em; }
</style>
</head>
<body>
<h1>${this.escapeHtml(title)}</h1>
${content.split('\n\n').filter(Boolean).map(p => `<p>${this.escapeHtml(p)}</p>`).join('\n')}
</body>
</html>`;

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: wrapped,
      size: wrapped.length,
      mimeType: this.mimeType,
    };
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
