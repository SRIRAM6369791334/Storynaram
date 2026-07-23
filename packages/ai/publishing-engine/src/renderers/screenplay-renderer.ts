import { Renderer, type RendererResult, type RenderOptions } from './renderer.js';
import type { RenderFormat } from '../types/publishing-context.js';

export class ScreenplayRenderer extends Renderer {
  readonly format: RenderFormat = 'screenplay';
  readonly name = 'Screenplay Renderer';

  render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult {
    const parts: string[] = [];
    const renderedChapters: import('../types/publishing-result').RenderedChapter[] = [];
    let totalWords = 0;

    parts.push('FADE IN:\n\n');

    for (const chapter of chapters) {
      const sceneHeading = `\n${chapter.title.toUpperCase()}\n\n`;
      let body = sceneHeading;

      const lines = chapter.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          body += '\n';
          continue;
        }

        if (trimmed.startsWith('"') && trimmed.includes('"')) {
          body += `          ${trimmed}\n`;
        } else {
          body += `${trimmed}\n\n`;
        }
      }

      if (options?.pageBreaks) {
        body += '\nFADE OUT.\n\n---\n\nFADE IN.\n\n';
      }

      const wordCount = chapter.content.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += wordCount;
      parts.push(body);

      renderedChapters.push({
        number: chapter.number,
        title: chapter.title,
        content: body,
        wordCount,
      });
    }

    parts.push('\nFADE OUT.\n\nTHE END');

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
