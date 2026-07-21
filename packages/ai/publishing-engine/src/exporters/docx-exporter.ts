import { Exporter, type ExportResult } from './exporter';
import type { ExportFormat } from '../types/publishing-context';

export class DOCXExporter extends Exporter {
  readonly format: ExportFormat = 'docx';
  readonly mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  readonly extension = '.docx';

  export(content: string, title: string): ExportResult {
    const paragraphs = content.split('\n\n').filter(Boolean).map(para =>
      `<w:p><w:r><w:t xml:space="preserve">${this.escapeXml(para)}</w:t></w:r></w:p>`
    ).join('\n    ');

    const skeleton = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:rFonts w:ascii="Times New Roman"/><w:sz w:val="48"/></w:rPr><w:t>${this.escapeXml(title)}</w:t></w:r></w:p>
    ${paragraphs}
  </w:body>
</w:document>`;

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: skeleton,
      size: skeleton.length,
      mimeType: this.mimeType,
    };
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
