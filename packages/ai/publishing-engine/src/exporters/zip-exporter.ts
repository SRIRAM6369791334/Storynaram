import { Exporter, type ExportResult } from './exporter';
import type { ExportFormat } from '../types/publishing-context';
import type { ExportedFile } from '../types/publishing-result';

export class ZIPExporter extends Exporter {
  readonly format: ExportFormat = 'zip';
  readonly mimeType = 'application/zip';
  readonly extension = '.zip';

  export(content: string, title: string): ExportResult {
    const files: Array<{ name: string; content: string }> = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        files.push(...parsed);
      } else {
        files.push({ name: `${title}.json`, content });
      }
    } catch {
      files.push({ name: `${title}.txt`, content });
    }

    let zipContent = 'PK';
    let offset = 0;
    const entries: Array<{ header: string; localHeader: string }> = [];

    for (const file of files) {
      const nameBytes = Buffer ? Buffer.byteLength(file.name, 'utf-8') : file.name.length;
      const contentBytes = Buffer ? Buffer.byteLength(file.content, 'utf-8') : file.content.length;

      const localHeader = this.makeLocalFileHeader(file.name, contentBytes);
      const centralHeader = this.makeCentralDirectoryHeader(file.name, contentBytes, offset);

      offset += localHeader.length + contentBytes;
      entries.push({ header: centralHeader, localHeader: localHeader + file.content });
    }

    const centralDir = entries.map(e => e.header).join('');
    const eocd = this.makeEndOfCentralDirectory(entries.length, offset, centralDir.length);

    zipContent = entries.map(e => e.localHeader).join('') + centralDir + eocd;

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: zipContent,
      size: zipContent.length,
      mimeType: this.mimeType,
    };
  }

  private makeLocalFileHeader(name: string, size: number): string {
    const nameBytes = Buffer ? Buffer.from(name, 'utf-8') : name;
    return `PK\x03\x04\x0A\x00\x00\x00\x00\x00${'\x00'.repeat(8)}${String.fromCharCode(size & 0xFF, (size >> 8) & 0xFF)}${String.fromCharCode(size & 0xFF, (size >> 8) & 0xFF)}${nameBytes}${'\x00'.repeat(8)}`;
  }

  private makeCentralDirectoryHeader(name: string, size: number, offset: number): string {
    const nameBytes = Buffer ? Buffer.from(name, 'utf-8') : name;
    return `PK\x01\x02\x14\x00\x0A\x00\x00\x00\x00\x00${'\x00'.repeat(8)}${String.fromCharCode(size & 0xFF, (size >> 8) & 0xFF)}${String.fromCharCode(size & 0xFF, (size >> 8) & 0xFF)}${'\x00'.repeat(4)}${String.fromCharCode(offset & 0xFF, (offset >> 8) & 0xFF, (offset >> 16) & 0xFF, (offset >> 24) & 0xFF)}${nameBytes}${'\x00'.repeat(8)}`;
  }

  private makeEndOfCentralDirectory(count: number, centralOffset: number, centralSize: number): string {
    return `PK\x05\x06${'\x00'.repeat(4)}${String.fromCharCode(count & 0xFF, (count >> 8) & 0xFF)}${String.fromCharCode(count & 0xFF, (count >> 8) & 0xFF)}${String.fromCharCode(centralSize & 0xFF, (centralSize >> 8) & 0xFF)}${String.fromCharCode(centralOffset & 0xFF, (centralOffset >> 8) & 0xFF, (centralOffset >> 16) & 0xFF, (centralOffset >> 24) & 0xFF)}${'\x00'.repeat(2)}`;
  }
}
