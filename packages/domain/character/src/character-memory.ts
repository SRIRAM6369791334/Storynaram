import { ValueObject, Timestamp } from '@storynaram/domain-kernel';

export class MemoryEntry {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly emotionalWeight: number = 0,
    public readonly timestamp: Timestamp = Timestamp.now(),
    public readonly isSignificant: boolean = false,
  ) {
    if (emotionalWeight < 0 || emotionalWeight > 10) {
      throw new Error(`Emotional weight must be between 0 and 10: ${emotionalWeight}`);
    }
  }
}

export class CharacterMemory extends ValueObject {
  private readonly items: Map<string, MemoryEntry>;

  constructor(memories: MemoryEntry[] = []) {
    super();
    this.items = new Map();
    for (const memory of memories) {
      this.items.set(memory.id, memory);
    }
  }

  get all(): readonly MemoryEntry[] {
    return Array.from(this.items.values());
  }

  get significant(): MemoryEntry[] {
    return this.all.filter(m => m.isSignificant);
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): MemoryEntry | undefined {
    return this.items.get(id);
  }

  add(memory: MemoryEntry): CharacterMemory {
    const next = new Map(this.items);
    next.set(memory.id, memory);
    return new CharacterMemory(Array.from(next.values()));
  }

  remove(id: string): CharacterMemory {
    const next = new Map(this.items);
    next.delete(id);
    return new CharacterMemory(Array.from(next.values()));
  }

  sortedByRecent(): MemoryEntry[] {
    return [...this.all].sort((a, b) => b.timestamp.value.getTime() - a.timestamp.value.getTime());
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown>[] {
    return this.all.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      emotionalWeight: m.emotionalWeight,
      timestamp: m.timestamp.toJSON(),
      isSignificant: m.isSignificant,
    }));
  }
}
