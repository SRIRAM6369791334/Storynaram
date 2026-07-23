import { ValueObject } from '@storynaram/domain-kernel';
import { CanonEntry } from './canon-entry.js';
import { FactType } from './canon-fact.js';

export class CanonCollection extends ValueObject {
  private readonly items: Map<string, CanonEntry>;

  constructor(entries: CanonEntry[] = []) {
    super();
    this.items = new Map();
    for (const e of entries) {
      this.items.set(e.entryId, e);
    }
  }

  get all(): readonly CanonEntry[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(entryId: string): CanonEntry | undefined {
    return this.items.get(entryId);
  }

  has(entryId: string): boolean {
    return this.items.has(entryId);
  }

  add(entry: CanonEntry): CanonCollection {
    const next = new Map(this.items);
    next.set(entry.entryId, entry);
    return new CanonCollection(Array.from(next.values()));
  }

  remove(entryId: string): CanonCollection {
    const next = new Map(this.items);
    next.delete(entryId);
    return new CanonCollection(Array.from(next.values()));
  }

  findByKey(key: string): CanonEntry[] {
    return this.all.filter(e => e.key === key);
  }

  ofType(factType: FactType): CanonEntry[] {
    return this.all.filter(e => e.factType === factType);
  }

  withStatus(status: string): CanonEntry[] {
    return this.all.filter(e => e.status === status);
  }

  withOpenConflicts(): CanonEntry[] {
    return this.all.filter(e => e.hasOpenConflicts());
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(e => e.toJSON()) };
  }
}
