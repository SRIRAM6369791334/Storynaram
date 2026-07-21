import { Renderer, type RendererResult, type RenderOptions } from './renderer';
import type { RenderFormat } from '../types/publishing-context';

export class JSONRenderer extends Renderer {
  readonly format: RenderFormat = 'json';
  readonly name = 'JSON Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    for (const chapter of chapters) {
      const wordCount = chapter.content.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += wordCount;

      renderedChapters.push({
        number: chapter.number,
        title: chapter.title,
        content: chapter.content,
        wordCount,
      });
    }

    const data = {
      format: 'json',
      version: '1.0',
      metadata: {
        totalChapters: chapters.length,
        totalWords,
        generatedAt: new Date().toISOString(),
      },
      chapters: renderedChapters.map(ch => ({
        number: ch.number,
        title: ch.title,
        wordCount: ch.wordCount,
        content: ch.content,
      })),
    };

    const content = JSON.stringify(data, null, 2);

    return {
      format: this.format,
      content,
      chapters: renderedChapters,
      wordCount: totalWords,
      size: content.length,
    };
  }
}
