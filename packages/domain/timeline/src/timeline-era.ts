import { ValueObject } from '@storynaram/domain-kernel';
import { TimelineDate } from './timeline-date';

export class TimelineEra {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly startDate: TimelineDate,
    public readonly description: string = '',
    public readonly endDate?: TimelineDate,
  ) {
    if (name.trim().length === 0) throw new Error('Era name cannot be empty');
    if (endDate && !startDate.isBefore(endDate)) {
      throw new Error('Era start must be before end');
    }
  }

  contains(date: TimelineDate): boolean {
    if (date.isBefore(this.startDate)) return false;
    if (this.endDate && (date.isAfter(this.endDate) || date.isEqual(this.endDate))) return false;
    return true;
  }
}

export class TimelineEras extends ValueObject {
  private readonly items: Map<string, TimelineEra>;

  constructor(eras: TimelineEra[] = []) {
    super();
    this.items = new Map();
    for (const e of eras) {
      this.items.set(e.id, e);
    }
  }

  get all(): readonly TimelineEra[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): TimelineEra | undefined {
    return this.items.get(id);
  }

  add(era: TimelineEra): TimelineEras {
    const next = new Map(this.items);
    next.set(era.id, era);
    return new TimelineEras(Array.from(next.values()));
  }

  remove(id: string): TimelineEras {
    const next = new Map(this.items);
    next.delete(id);
    return new TimelineEras(Array.from(next.values()));
  }

  eraForDate(date: TimelineDate): TimelineEra | undefined {
    return this.all.find(e => e.contains(date));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(e => ({
      id: e.id, name: e.name, startDate: e.startDate.toJSON(),
      description: e.description, endDate: e.endDate?.toJSON(),
    }))};
  }
}
