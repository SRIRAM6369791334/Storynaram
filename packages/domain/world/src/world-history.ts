import { ValueObject, Timestamp } from '@storynaram/domain-kernel';

export class WorldEvent {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly date: string,
    public readonly significance: number,
    public readonly timestamp: Timestamp = Timestamp.now(),
    public readonly relatedEntityIds: string[] = [],
  ) {
    if (title.trim().length === 0) throw new Error('Event title cannot be empty');
    if (significance < 0 || significance > 100) throw new Error(`Significance must be between 0 and 100: ${significance}`);
  }
}

export class WorldHistory extends ValueObject {
  private readonly items: Map<string, WorldEvent>;

  constructor(events: WorldEvent[] = []) {
    super();
    this.items = new Map();
    for (const e of events) {
      this.items.set(e.id, e);
    }
  }

  get all(): readonly WorldEvent[] {
    return this.sortedByDate();
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): WorldEvent | undefined {
    return this.items.get(id);
  }

  add(event: WorldEvent): WorldHistory {
    const next = new Map(this.items);
    next.set(event.id, event);
    return new WorldHistory(Array.from(next.values()));
  }

  significant(threshold: number = 70): WorldEvent[] {
    return this.all.filter(e => e.significance >= threshold);
  }

  inEra(dateRange: { start: string; end: string }): WorldEvent[] {
    return this.all.filter(e => e.date >= dateRange.start && e.date <= dateRange.end);
  }

  private sortedByDate(): WorldEvent[] {
    return Array.from(this.items.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      significance: e.significance,
      timestamp: e.timestamp.toJSON(),
      relatedEntityIds: e.relatedEntityIds,
    }))};
  }
}
