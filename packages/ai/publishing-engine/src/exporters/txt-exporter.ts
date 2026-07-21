import { Exporter, type ExportResult } from './exporter';
import type { ExportFormat } from '../types/publishing-context';

export class TXTExporter extends Exporter {
  readonly format: ExportFormat = 'txt';
  readonly mimeType = 'text/plain';
  readonly extension = '.txt';

  export(content: string, title: string): ExportResult {
    const wrapped = `${title}\n${'='.repeat(title.length)}\n\n${content}`;

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: wrapped,
      size: wrapped.length,
      mimeType: this.mimeType,
    };
  }
}
