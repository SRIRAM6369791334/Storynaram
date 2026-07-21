import { Exporter, type ExportResult } from './exporter';
import type { ExportFormat } from '../types/publishing-context';

export class JSONExporter extends Exporter {
  readonly format: ExportFormat = 'json';
  readonly mimeType = 'application/json';
  readonly extension = '.json';

  export(content: string, title: string): ExportResult {
    const data = JSON.stringify({
      title,
      exportedAt: new Date().toISOString(),
      content,
      metadata: { format: 'json', version: '1.0' },
    }, null, 2);

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: data,
      size: data.length,
      mimeType: this.mimeType,
    };
  }
}
