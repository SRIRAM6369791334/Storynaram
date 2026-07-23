import { ValueObject } from '@storynaram/domain-kernel';
import { BeatNumber } from './narrative-numbers.js';
import { WordCount } from './narrative-metrics.js';

export type BeatType = 'setup' | 'conflict' | 'decision' | 'revelation' | 'action' | 'reaction' | 'resolution' | 'transition';

export class Beat {
  constructor(
    public readonly beatId: string,
    public readonly sceneId: string,
    public readonly beatNumber: BeatNumber,
    public readonly beatType: BeatType,
    public readonly content: string = '',
    public readonly wordCount: WordCount = WordCount.zero(),
    public readonly notes: readonly string[] = [],
  ) {
    if (beatId.trim().length === 0) throw new Error('Beat ID cannot be empty');
    if (sceneId.trim().length === 0) throw new Error('Beat scene ID cannot be empty');
  }
}

export class BeatCollection extends ValueObject {
  private readonly items: Map<string, Beat>;

  constructor(beats: Beat[] = []) {
    super();
    this.items = new Map();
    for (const b of beats) {
      this.items.set(b.beatId, b);
    }
  }

  get all(): readonly Beat[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Beat | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(beat: Beat): BeatCollection {
    const next = new Map(this.items);
    next.set(beat.beatId, beat);
    return new BeatCollection(Array.from(next.values()));
  }

  remove(id: string): BeatCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new BeatCollection(Array.from(next.values()));
  }

  ofScene(sceneId: string): Beat[] {
    return this.all.filter(b => b.sceneId === sceneId);
  }

  ofType(beatType: BeatType): Beat[] {
    return this.all.filter(b => b.beatType === beatType);
  }

  sorted(): Beat[] {
    return [...this.all].sort((a, b) => a.beatNumber.value - b.beatNumber.value);
  }

  totalWordCount(): WordCount {
    return this.all.reduce((sum, b) => sum.add(b.wordCount), WordCount.zero());
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(b => ({
      beatId: b.beatId, sceneId: b.sceneId,
      beatNumber: b.beatNumber.value, beatType: b.beatType,
      content: b.content, wordCount: b.wordCount.value,
      notes: [...b.notes],
    }))};
  }
}
