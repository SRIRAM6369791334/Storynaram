import { Renderer, type RendererResult, type RenderOptions } from './renderer';
import type { RenderFormat } from '../types/publishing-context';

export class InteractiveFictionRenderer extends Renderer {
  readonly format: RenderFormat = 'interactive-fiction';
  readonly name = 'Interactive Fiction Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const parts: string[] = [];
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    for (const chapter of chapters) {
      const ifLines: string[] = [];
      ifLines.push(`:: ${chapter.title}`);
      ifLines.push(`# Chapter ${chapter.number}\n`);

      const lines = chapter.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('"') && trimmed.includes('"')) {
          ifLines.push(`  "${trimmed.replace(/"/g, '')}"`);
        } else if (trimmed.toLowerCase().includes('if') || trimmed.toLowerCase().includes('then')) {
          ifLines.push(`  * ${trimmed}`);
        } else if (trimmed.toLowerCase().startsWith('[[') || trimmed.toLowerCase().includes('[[')) {
          ifLines.push(`  ${trimmed}`);
        } else {
          ifLines.push(`  ${trimmed}`);
        }
      }

      ifLines.push(`  [[Continue -> Chapter ${chapter.number + 1}]]`);

      const chapterContent = ifLines.join('\n');
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

    const fullContent = parts.join('\n\n');

    return {
      format: this.format,
      content: fullContent,
      chapters: renderedChapters,
      wordCount: totalWords,
      size: fullContent.length,
    };
  }
}
