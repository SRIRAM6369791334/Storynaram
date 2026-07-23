import type { ExportFormat } from '../types/publishing-context.js';
import type { ExportedFile } from '../types/publishing-result.js';

export interface ExportResult {
  format: ExportFormat;
  filename: string;
  content: string;
  size: number;
  mimeType: string;
}

export abstract class Exporter {
  abstract readonly format: ExportFormat;
  abstract readonly mimeType: string;
  abstract readonly extension: string;

  abstract export(
    content: string,
    title: string,
  ): ExportResult;
}
