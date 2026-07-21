import { ValueObject } from '@storynaram/domain-kernel';

export type ConflictCategory =
  | 'characterVsCharacter'
  | 'characterVsSelf'
  | 'characterVsSociety'
  | 'characterVsNature'
  | 'characterVsTechnology'
  | 'characterVsWorld';

export type ConflictSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export type ConflictState = 'active' | 'escalating' | 'resolved' | 'abandoned';

export class ConflictResolution extends ValueObject {
  constructor(
    public readonly resolved: boolean = false,
    public readonly resolution: string = '',
    public readonly victor: string = '',
    public readonly cost: string = '',
    public readonly outcome: string = '',
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.resolved, this.resolution.toLowerCase(), this.victor.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { resolved: this.resolved, resolution: this.resolution, victor: this.victor, cost: this.cost, outcome: this.outcome };
  }
}

export class Conflict {
  constructor(
    public readonly conflictId: string,
    public readonly category: ConflictCategory,
    public readonly severity: ConflictSeverity = 'moderate',
    public readonly state: ConflictState = 'active',
    public readonly parties: readonly string[] = [],
    public readonly description: string = '',
    public readonly rootCause: string = '',
    public readonly stakes: string = '',
    public readonly resolution: ConflictResolution = new ConflictResolution(),
    public readonly relatedPlotPointIds: readonly string[] = [],
    public readonly relatedArcIds: readonly string[] = [],
  ) {
    if (conflictId.trim().length === 0) throw new Error('Conflict ID cannot be empty');
  }
}

export class ConflictCollection extends ValueObject {
  private readonly items: Map<string, Conflict>;

  constructor(conflicts: Conflict[] = []) {
    super();
    this.items = new Map();
    for (const c of conflicts) {
      this.items.set(c.conflictId, c);
    }
  }

  get all(): readonly Conflict[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Conflict | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(conflict: Conflict): ConflictCollection {
    const next = new Map(this.items);
    next.set(conflict.conflictId, conflict);
    return new ConflictCollection(Array.from(next.values()));
  }

  remove(id: string): ConflictCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new ConflictCollection(Array.from(next.values()));
  }

  ofCategory(category: ConflictCategory): Conflict[] {
    return this.all.filter(c => c.category === category);
  }

  ofState(state: ConflictState): Conflict[] {
    return this.all.filter(c => c.state === state);
  }

  active(): Conflict[] {
    return this.all.filter(c => c.state === 'active' || c.state === 'escalating');
  }

  resolved(): Conflict[] {
    return this.all.filter(c => c.state === 'resolved');
  }

  involvingParty(partyId: string): Conflict[] {
    return this.all.filter(c => c.parties.includes(partyId));
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(c => ({
      conflictId: c.conflictId, category: c.category, severity: c.severity,
      state: c.state, parties: [...c.parties], description: c.description,
      rootCause: c.rootCause, stakes: c.stakes,
      resolution: c.resolution.toJSON(),
      relatedPlotPointIds: [...c.relatedPlotPointIds], relatedArcIds: [...c.relatedArcIds],
    }))};
  }
}
