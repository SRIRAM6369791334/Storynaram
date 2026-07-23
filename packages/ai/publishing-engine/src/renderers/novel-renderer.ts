import { Renderer, type RendererResult, type RenderOptions } from './renderer.js';
import type { RenderFormat } from '../types/publishing-context.js';

export class NovelRenderer extends Renderer {
  readonly format: RenderFormat = 'novel';
  readonly name = 'Novel Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const parts: string[] = [];
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    for (const chapter of chapters) {
      const heading = `# ${chapter.title}\n\n`;
      const body = options?.chapterHeadings !== false ? heading + chapter.content : chapter.content;

      const wordCount = chapter.content.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += wordCount;

      if (options?.pageBreaks && parts.length > 0) {
        parts.push('\n\n---\n\n');
      }

      parts.push(body);

      renderedChapters.push({
        number: chapter.number,
        title: chapter.title,
        content: body,
        wordCount,
      });
    }

    const fullContent = parts.join('');

    return {
      format: this.format,
      content: fullContent,
      chapters: renderedChapters,
      wordCount: totalWords,
      size: fullContent.length,
    };
  }
}
