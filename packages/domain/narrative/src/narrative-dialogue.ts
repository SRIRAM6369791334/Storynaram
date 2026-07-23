import { ValueObject } from '@storynaram/domain-kernel';
import { DialogueOrder } from './narrative-numbers.js';
import { WordCount } from './narrative-metrics.js';

export class Dialogue {
  constructor(
    public readonly dialogueId: string,
    public readonly beatId: string,
    public readonly order: DialogueOrder,
    public readonly speaker: string,
    public readonly content: string,
    public readonly target: string = '',
    public readonly emotion: string = '',
    public readonly tone: string = '',
    public readonly tags: readonly string[] = [],
    public readonly isInternalMonologue: boolean = false,
    public readonly isNarration: boolean = false,
    public readonly wordCount: WordCount = WordCount.zero(),
  ) {
    if (dialogueId.trim().length === 0) throw new Error('Dialogue ID cannot be empty');
    if (beatId.trim().length === 0) throw new Error('Dialogue beat ID cannot be empty');
    if (speaker.trim().length === 0) throw new Error('Dialogue speaker cannot be empty');
    if (content.trim().length === 0) throw new Error('Dialogue content cannot be empty');
  }
}

export class DialogueCollection extends ValueObject {
  private readonly items: Map<string, Dialogue>;

  constructor(dialogues: Dialogue[] = []) {
    super();
    this.items = new Map();
    for (const d of dialogues) {
      this.items.set(d.dialogueId, d);
    }
  }

  get all(): readonly Dialogue[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Dialogue | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(dialogue: Dialogue): DialogueCollection {
    const next = new Map(this.items);
    next.set(dialogue.dialogueId, dialogue);
    return new DialogueCollection(Array.from(next.values()));
  }

  remove(id: string): DialogueCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new DialogueCollection(Array.from(next.values()));
  }

  ofBeat(beatId: string): Dialogue[] {
    return this.all.filter(d => d.beatId === beatId);
  }

  ofSpeaker(speaker: string): Dialogue[] {
    return this.all.filter(d => d.speaker === speaker);
  }

  sorted(): Dialogue[] {
    return [...this.all].sort((a, b) => a.order.value - b.order.value);
  }

  totalWordCount(): WordCount {
    return this.all.reduce((sum, d) => sum.add(d.wordCount), WordCount.zero());
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(d => ({
      dialogueId: d.dialogueId, beatId: d.beatId,
      order: d.order.value, speaker: d.speaker,
      content: d.content, target: d.target,
      emotion: d.emotion, tone: d.tone,
      tags: [...d.tags],
      isInternalMonologue: d.isInternalMonologue,
      isNarration: d.isNarration,
      wordCount: d.wordCount.value,
    }))};
  }
}
