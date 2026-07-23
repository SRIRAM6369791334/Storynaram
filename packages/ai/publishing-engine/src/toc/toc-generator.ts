import type { TOCEntry } from '../types/publishing-result.js';

export interface TOCGeneratorOptions {
  includeChapterIndex?: boolean;
  includeSceneIndex?: boolean;
  includeCharacterIndex?: boolean;
  includeLocationIndex?: boolean;
  includeTimelineIndex?: boolean;
}

export class TOCGenerator {
  generateTOC(
    chapters: Array<{ number: number; title: string }>,
    options?: TOCGeneratorOptions,
  ): TOCEntry[] {
    const entries: TOCEntry[] = [];

    for (const chapter of chapters) {
      entries.push({
        level: 1,
        title: `Chapter ${chapter.number}: ${chapter.title}`,
        pageReference: `ch${chapter.number}`,
        children: [],
      });
    }

    return entries;
  }

  generateFullTOC(
    bookTitle: string,
    chapters: Array<{ number: number; title: string }>,
    options?: TOCGeneratorOptions,
  ): string {
    const lines: string[] = [];

    lines.push(`# ${bookTitle}`);
    lines.push('');
    lines.push('## Table of Contents');
    lines.push('');

    for (const chapter of chapters) {
      lines.push(`- Chapter ${chapter.number}: ${chapter.title}`);
    }

    if (options?.includeChapterIndex) {
      lines.push('');
      lines.push('## Chapter Index');
      lines.push('');
      for (const chapter of chapters) {
        lines.push(`  - Chapter ${chapter.number}: ${chapter.title}`);
      }
    }

    if (options?.includeSceneIndex) {
      lines.push('');
      lines.push('## Scene Index');
      lines.push('');
      lines.push('  - (Scene index content)');
    }

    if (options?.includeCharacterIndex) {
      lines.push('');
      lines.push('## Character Index');
      lines.push('');
    }

    if (options?.includeLocationIndex) {
      lines.push('');
      lines.push('## Location Index');
      lines.push('');
    }

    if (options?.includeTimelineIndex) {
      lines.push('');
      lines.push('## Timeline Index');
      lines.push('');
    }

    return lines.join('\n');
  }

  generateBookTOC(chapters: Array<{ number: number; title: string }>): string {
    const lines: string[] = [];
    lines.push('Table of Contents');
    lines.push('=================');
    lines.push('');
    for (const chapter of chapters) {
      lines.push(`  ${chapter.number}. ${chapter.title}`);
    }
    return lines.join('\n');
  }

  countTOCEntries(chapters: Array<{ number: number; title: string }>): number {
    return chapters.length;
  }
}
