import type { RenderedChapter } from '../types/publishing-result';
import type { RenderFormat } from '../types/publishing-context';

export interface RenderOptions {
  chapterHeadings?: boolean;
  pageBreaks?: boolean;
  includeFootnotes?: boolean;
  includeEndnotes?: boolean;
  fontSize?: number;
  lineHeight?: number;
  margins?: { top: number; bottom: number; left: number; right: number };
}

export interface RendererResult {
  format: RenderFormat;
  content: string;
  chapters: RenderedChapter[];
  wordCount: number;
  size: number;
}

export abstract class Renderer {
  abstract readonly format: RenderFormat;
  abstract readonly name: string;

  abstract render(
    chapters: Array<{ number: number; title: string; content: string }>,
    options?: RenderOptions,
  ): RendererResult;
}
