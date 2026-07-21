import { Renderer, type RendererResult, type RenderOptions } from './renderer';
import type { RenderFormat } from '../types/publishing-context';

export class ComicRenderer extends Renderer {
  readonly format: RenderFormat = 'comic';
  readonly name = 'Comic Script Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const parts: string[] = [];
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    for (const chapter of chapters) {
      const panels: string[] = [];
      const lines = chapter.content.split('\n');
      let panelIndex = 1;

      panels.push(`**PAGE ${chapter.number}**\n\n`);

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('"') && trimmed.includes('"')) {
          panels.push(`  PANEL ${panelIndex} (BALLOON)\n  ${trimmed}\n\n`);
        } else if (trimmed.includes(':')) {
          const [speaker = '', ...rest] = trimmed.split(':');
          panels.push(`  PANEL ${panelIndex}\n  ${speaker.trim().toUpperCase()}: ${rest.join(':').trim()}\n\n`);
        } else if (trimmed.match(/^(EXTERIOR|INTERIOR|EXT|INT)/i)) {
          panels.push(`  **${trimmed.toUpperCase()}**\n\n`);
        } else {
          panels.push(`  PANEL ${panelIndex} (CAPTION)\n  ${trimmed}\n\n`);
        }
        panelIndex++;
      }

      const chapterContent = panels.join('');
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

    const fullContent = parts.join('\n---\n\n');

    return {
      format: this.format,
      content: fullContent,
      chapters: renderedChapters,
      wordCount: totalWords,
      size: fullContent.length,
    };
  }
}
