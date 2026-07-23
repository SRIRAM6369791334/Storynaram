import { ValueObject } from '@storynaram/domain-kernel';
import { ChapterNumber } from './narrative-numbers.js';
import { WordCount } from './narrative-metrics.js';

export type ChapterStatus = 'draft' | 'revised' | 'final';

export class Chapter {
  constructor(
    public readonly chapterId: string,
    public readonly title: string,
    public readonly chapterNumber: ChapterNumber,
    public readonly summary: string = '',
    public readonly wordCount: WordCount = WordCount.zero(),
    public readonly status: ChapterStatus = 'draft',
    public readonly notes: readonly string[] = [],
  ) {
    if (chapterId.trim().length === 0) throw new Error('Chapter ID cannot be empty');
    if (title.trim().length === 0) throw new Error('Chapter title cannot be empty');
  }
}

export class ChapterCollection extends ValueObject {
  private readonly items: Map<string, Chapter>;

  constructor(chapters: Chapter[] = []) {
    super();
    this.items = new Map();
    for (const c of chapters) {
      this.items.set(c.chapterId, c);
    }
  }

  get all(): readonly Chapter[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Chapter | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(chapter: Chapter): ChapterCollection {
    const next = new Map(this.items);
    next.set(chapter.chapterId, chapter);
    return new ChapterCollection(Array.from(next.values()));
  }

  remove(id: string): ChapterCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new ChapterCollection(Array.from(next.values()));
  }

  getByNumber(number: ChapterNumber): Chapter | undefined {
    return this.all.find(c => c.chapterNumber.value === number.value);
  }

  sorted(): Chapter[] {
    return [...this.all].sort((a, b) => a.chapterNumber.value - b.chapterNumber.value);
  }

  withStatus(status: ChapterStatus): Chapter[] {
    return this.all.filter(c => c.status === status);
  }

  totalWordCount(): WordCount {
    return this.all.reduce((sum, c) => sum.add(c.wordCount), WordCount.zero());
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(c => ({
      chapterId: c.chapterId, title: c.title,
      chapterNumber: c.chapterNumber.value,
      summary: c.summary, wordCount: c.wordCount.value,
      status: c.status, notes: [...c.notes],
    }))};
  }
}
