import { Renderer, type RendererResult, type RenderOptions } from './renderer';
import type { RenderFormat } from '../types/publishing-context';

export class VisualNovelRenderer extends Renderer {
  readonly format: RenderFormat = 'visual-novel';
  readonly name = 'Visual Novel Script Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const parts: string[] = [];
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    for (const chapter of chapters) {
      const scriptLines: string[] = [];
      scriptLines.push(`// Scene: ${chapter.title}`);
      scriptLines.push(`// Chapter ${chapter.number}\n`);

      const lines = chapter.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('"') && trimmed.includes('"')) {
          scriptLines.push(`@dialog "${trimmed.replace(/"/g, '\\"')}"`);
        } else if (trimmed.includes(':')) {
          const [speaker = '', ...rest] = trimmed.split(':');
          scriptLines.push(`${speaker.trim().toLowerCase()}: "${rest.join(':').trim()}"`);
        } else if (trimmed.match(/^(EXTERIOR|INTERIOR|EXT|INT)/i)) {
          scriptLines.push(`@scene "${trimmed}"`);
        } else {
          scriptLines.push(`@narration "${trimmed}"`);
        }
      }

      const chapterContent = scriptLines.join('\n');
      const wordCount = chapter.content.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += wordCount;

      parts.push(chapterContent);
      renderedChapters.push({
        number: chapter.number,
        title: chapter.title,
        content: chapterContent,
        wordCount,
      });
    }

    const fullContent = parts.join('\n\n---\n\n');

    return {
      format: this.format,
      content: fullContent,
      chapters: renderedChapters,
      wordCount: totalWords,
      size: fullContent.length,
    };
  }
}
