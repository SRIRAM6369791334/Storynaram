import { Exporter, type ExportResult } from './exporter';
import type { ExportFormat } from '../types/publishing-context';

export class EPUBExporter extends Exporter {
  readonly format: ExportFormat = 'epub';
  readonly mimeType = 'application/epub+zip';
  readonly extension = '.epub';

  export(content: string, title: string): ExportResult {
    const chapters = content.split('\n\n').filter(Boolean);
    const chapterItems = chapters.map((_, i) =>
      `<item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n  ');
    const chapterRefs = chapters.map((_, i) =>
      `<itemref idref="chapter${i + 1}"/>`
    ).join('\n  ');

    const skeleton = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="bookid">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${title}</dc:title>
    <dc:language xmlns:dc="http://purl.org/dc/elements/1.1/">en</dc:language>
    <dc:identifier xmlns:dc="http://purl.org/dc/elements/1.1/" id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${chapterItems}
  </manifest>
  <spine toc="ncx">
    ${chapterRefs}
  </spine>
</package>`;

    return {
      format: this.format,
      filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}${this.extension}`,
      content: skeleton,
      size: skeleton.length,
      mimeType: this.mimeType,
    };
  }
}
