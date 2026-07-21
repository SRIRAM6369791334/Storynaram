import { ValueObject } from '@storynaram/domain-kernel';
import { TimelineDate } from './timeline-date';
import { TimelineDuration } from './timeline-date';

export type EventType = 'historical' | 'political' | 'character' | 'world' | 'magic' | 'technology' | 'war' | 'discovery' | 'disaster' | 'personal';

export class TimelineEvent {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly date: TimelineDate,
    public readonly eventType: EventType,
    public readonly importance: number = 50,
    public readonly branchId: string = 'main',
    public readonly causeEventIds: string[] = [],
    public readonly consequenceEventIds: string[] = [],
    public readonly tags: string[] = [],
    public readonly location?: string,
    public readonly duration?: TimelineDuration,
  ) {
    if (title.trim().length === 0) throw new Error('Event title cannot be empty');
    if (importance < 0 || importance > 100) throw new Error(`Importance must be between 0 and 100: ${importance}`);
  }

  hasTag(tag: string): boolean {
    return this.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  isCausedBy(eventId: string): boolean {
    return this.causeEventIds.includes(eventId);
  }
}

export class TimelineEvents extends ValueObject {
  private readonly items: Map<string, TimelineEvent>;

  constructor(events: TimelineEvent[] = []) {
    super();
    this.items = new Map();
    for (const e of events) {
      this.items.set(e.id, e);
    }
  }

  get all(): readonly TimelineEvent[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): TimelineEvent | undefined {
    return this.items.get(id);
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  add(event: TimelineEvent): TimelineEvents {
    const next = new Map(this.items);
    next.set(event.id, event);
    return new TimelineEvents(Array.from(next.values()));
  }

  remove(id: string): TimelineEvents {
    const next = new Map(this.items);
    next.delete(id);
    return new TimelineEvents(Array.from(next.values()));
  }

  inBranch(branchId: string): TimelineEvent[] {
    return this.all.filter(e => e.branchId === branchId);
  }

  ofType(eventType: EventType): TimelineEvent[] {
    return this.all.filter(e => e.eventType === eventType);
  }

  inDateRange(start: TimelineDate, end: TimelineDate): TimelineEvent[] {
    return this.all.filter(e =>
      (e.date.isAfter(start) || e.date.isEqual(start)) &&
      (e.date.isBefore(end) || e.date.isEqual(end)),
    );
  }

  sorted(): TimelineEvent[] {
    return [...this.all].sort((a, b) => a.date.compareTo(b.date));
  }

  sortedByImportance(): TimelineEvent[] {
    return [...this.all].sort((a, b) => b.importance - a.importance);
  }

  findByTag(tag: string): TimelineEvent[] {
    return this.all.filter(e => e.hasTag(tag));
  }

  getConsequencesOf(eventId: string): string[] {
    const event = this.items.get(eventId);
    return event ? [...event.consequenceEventIds] : [];
  }

  getCausesOf(eventId: string): string[] {
    const event = this.items.get(eventId);
    return event ? [...event.causeEventIds] : [];
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(e => ({
      id: e.id, title: e.title, description: e.description,
      date: e.date.toJSON(), eventType: e.eventType, importance: e.importance,
      branchId: e.branchId, causeEventIds: e.causeEventIds,
      consequenceEventIds: e.consequenceEventIds, tags: e.tags,
      location: e.location, duration: e.duration?.toJSON(),
    }))};
  }
}
