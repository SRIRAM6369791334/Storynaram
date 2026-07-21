import { ValueObject } from '@storynaram/domain-kernel';

export enum KnowledgeLevel {
  NOVICE = 'NOVICE',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  MASTER = 'MASTER',
}

export class KnowledgeEntry {
  constructor(
    public readonly id: string,
    public readonly topic: string,
    public level: KnowledgeLevel = KnowledgeLevel.NOVICE,
    public readonly source?: string,
  ) {}

  advance(): void {
    const levels = [KnowledgeLevel.NOVICE, KnowledgeLevel.INTERMEDIATE, KnowledgeLevel.ADVANCED, KnowledgeLevel.EXPERT, KnowledgeLevel.MASTER];
    const idx = levels.indexOf(this.level);
    if (idx < levels.length - 1) {
      this.level = levels[idx + 1] ?? this.level;
    }
  }
}

export class CharacterKnowledge extends ValueObject {
  private readonly items: Map<string, KnowledgeEntry>;

  constructor(entries: KnowledgeEntry[] = []) {
    super();
    this.items = new Map();
    for (const entry of entries) {
      this.items.set(entry.id, entry);
    }
  }

  get all(): readonly KnowledgeEntry[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): KnowledgeEntry | undefined {
    return this.items.get(id);
  }

  hasTopic(topic: string): boolean {
    return this.all.some(k => k.topic.toLowerCase() === topic.toLowerCase());
  }

  add(entry: KnowledgeEntry): CharacterKnowledge {
    const next = new Map(this.items);
    next.set(entry.id, entry);
    return new CharacterKnowledge(Array.from(next.values()));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown>[] {
    return this.all.map(k => ({
      id: k.id,
      topic: k.topic,
      level: k.level,
      source: k.source,
    }));
  }
}
