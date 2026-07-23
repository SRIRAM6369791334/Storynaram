import type { GeneratedChapter } from '../generation-result.js';

export class OutputAssembler {
  assembleFullStory(chapters: GeneratedChapter[]): string {
    return chapters
      .map(ch => {
        const header = this.formatChapterHeader(ch.number, ch.title);
        return `${header}\n\n${ch.content}`;
      })
      .join('\n\n');
  }

  assembleChapter(chapter: GeneratedChapter): string {
    const header = this.formatChapterHeader(chapter.number, chapter.title);
    return `${header}\n\n${chapter.content}`;
  }

  private formatChapterHeader(number: number, title: string): string {
    if (title.startsWith('Chapter') || /^\d+$/.test(title)) {
      return `# Chapter ${number}`;
    }
    return `# Chapter ${number}: ${title}`;
  }

  extractContentFromResponse(response: string): string {
    const trimmed = response.trim();

    const markdownCodeBlock = trimmed.match(/```(?:json|markdown|text)?\s*([\s\S]*?)```/);
    if (markdownCodeBlock) {
      return markdownCodeBlock[1]!.trim();
    }

    const chapterMatch = trimmed.match(/^#{1,3}\s.*(?:\n[\s\S]*?)(?=^#{1,3}\s|\Z)/m);
    if (chapterMatch) {
      return chapterMatch[0].trim();
    }

    return trimmed;
  }

  splitIntoChapters(fullText: string): Array<{ number: number; title: string; content: string }> {
    const chapters: Array<{ number: number; title: string; content: string }> = [];
    const chapterRegex = /^#{1,3}\s+(?:Chapter\s+)?(\d+)[.:]?\s*(.*)$/gim;
    const matches: Array<{ num: number; title: string; index: number; nextIndex: number }> = [];
    let match: RegExpExecArray | null;

    while ((match = chapterRegex.exec(fullText)) !== null) {
      matches.push({
        num: parseInt(match[1]!, 10),
        title: match[2]?.trim() || `Chapter ${match[1]}`,
        index: match.index,
        nextIndex: chapterRegex.lastIndex,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]!;
      const end = i < matches.length - 1 ? matches[i + 1]!.index : fullText.length;
      const content = fullText.slice(m.nextIndex, end).trim();
      chapters.push({ number: m.num, title: m.title, content });
    }

    return chapters;
  }

  calculateWordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}
