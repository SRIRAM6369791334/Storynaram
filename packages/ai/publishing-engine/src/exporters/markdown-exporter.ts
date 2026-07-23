import { Exporter, type ExportResult } from './exporter.js';
import type { ExportFormat } from '../types/publishing-context.js';

export class MarkdownExporter extends Exporter {
  readonly format: ExportFormat = 'markdown';
  readonly mimeType = 'text/markdown';
  readonly extension = '.md';

  export(content: string, title: string): ExportResult {
    const wrapped = `# ${title}\n\n${content}`;

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: wrapped,
      size: wrapped.length,
      mimeType: this.mimeType,
    };
  }
}
