import { Renderer, type RendererResult, type RenderOptions } from './renderer';
import type { RenderFormat } from '../types/publishing-context';

export class HTMLRenderer extends Renderer {
  readonly format: RenderFormat = 'html';
  readonly name = 'HTML Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    const htmlParts: string[] = [];
    htmlParts.push('<!DOCTYPE html>');
    htmlParts.push('<html lang="en">');
    htmlParts.push('<head>');
    htmlParts.push('<meta charset="UTF-8">');
    htmlParts.push('<title>Story</title>');
    htmlParts.push('<style>');
    htmlParts.push('body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2em; line-height: 1.6; }');
    htmlParts.push('h1 { text-align: center; margin-bottom: 1em; }');
    htmlParts.push('h2 { margin-top: 2em; }');
    htmlParts.push('p { text-indent: 1.5em; margin: 0.5em 0; }');
    htmlParts.push('.chapter { page-break-before: always; }');
    htmlParts.push('</style>');
    htmlParts.push('</head>');
    htmlParts.push('<body>');

    for (const chapter of chapters) {
      const bodyLines = ['<div class="chapter">'];
      bodyLines.push(`<h2>Chapter ${chapter.number}: ${this.escapeHtml(chapter.title)}</h2>`);

      const paragraphs = chapter.content.split('\n\n');
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('"') || trimmed.startsWith('"')) {
          bodyLines.push(`<p class="dialogue">${this.escapeHtml(trimmed)}</p>`);
        } else {
          bodyLines.push(`<p>${this.escapeHtml(trimmed)}</p>`);
        }
      }

      bodyLines.push('</div>');
      const chapterHtml = bodyLines.join('\n');

      const wordCount = chapter.content.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += wordCount;

      htmlParts.push(chapterHtml);
      renderedChapters.push({
        number: chapter.number,
        title: chapter.title,
        content: chapterHtml,
        wordCount,
      });
    }

    htmlParts.push('</body>');
    htmlParts.push('</html>');

    const fullContent = htmlParts.join('\n');

    return {
      format: this.format,
      content: fullContent,
      chapters: renderedChapters,
      wordCount: totalWords,
      size: fullContent.length,
    };
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
