import { ValueObject } from '@storynaram/domain-kernel';

export type ForeshadowStrength = 'subtle' | 'moderate' | 'obvious' | 'direct';

export class ForeshadowReference extends ValueObject {
  constructor(
    public readonly sourceId: string,
    public readonly sourceType: string,
    public readonly description: string = '',
  ) {
    super();
    if (sourceId.trim().length === 0) throw new Error('ForeshadowReference source ID cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.sourceId, this.sourceType, this.description.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { sourceId: this.sourceId, sourceType: this.sourceType, description: this.description };
  }
}

export class ForeshadowPayoff extends ValueObject {
  constructor(
    public readonly isPaidOff: boolean = false,
    public readonly payoffId: string = '',
    public readonly payoffChapter: string = '',
    public readonly payoffScene: string = '',
    public readonly satisfaction: number = 0,
  ) {
    super();
    if (satisfaction < 0 || satisfaction > 10) throw new Error('ForeshadowPayoff satisfaction must be 0-10');
  }

  paidOff(payoffId: string, chapterId: string, sceneId: string, satisfaction: number = 7): ForeshadowPayoff {
    return new ForeshadowPayoff(true, payoffId, chapterId, sceneId, satisfaction);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.isPaidOff, this.payoffId, this.satisfaction];
  }

  toJSON(): Record<string, unknown> {
    return { isPaidOff: this.isPaidOff, payoffId: this.payoffId, payoffChapter: this.payoffChapter, payoffScene: this.payoffScene, satisfaction: this.satisfaction };
  }
}

export class Foreshadow {
  constructor(
    public readonly foreshadowId: string,
    public readonly clue: string,
    public readonly strength: ForeshadowStrength = 'moderate',
    public readonly plantedIn: string = '',
    public readonly plantedChapter: string = '',
    public readonly plantedScene: string = '',
    public readonly hints: readonly string[] = [],
    public readonly references: readonly ForeshadowReference[] = [],
    public readonly payoff: ForeshadowPayoff = new ForeshadowPayoff(),
    public readonly notes: string = '',
  ) {
    if (foreshadowId.trim().length === 0) throw new Error('Foreshadow ID cannot be empty');
    if (clue.trim().length === 0) throw new Error('Foreshadow clue cannot be empty');
  }
}

export class ForeshadowCollection extends ValueObject {
  private readonly items: Map<string, Foreshadow>;

  constructor(items: Foreshadow[] = []) {
    super();
    this.items = new Map();
    for (const f of items) {
      this.items.set(f.foreshadowId, f);
    }
  }

  get all(): readonly Foreshadow[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Foreshadow | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(item: Foreshadow): ForeshadowCollection {
    const next = new Map(this.items);
    next.set(item.foreshadowId, item);
    return new ForeshadowCollection(Array.from(next.values()));
  }

  remove(id: string): ForeshadowCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new ForeshadowCollection(Array.from(next.values()));
  }

  unpaid(): Foreshadow[] {
    return this.all.filter(f => !f.payoff.isPaidOff);
  }

  paid(): Foreshadow[] {
    return this.all.filter(f => f.payoff.isPaidOff);
  }

  ofStrength(strength: ForeshadowStrength): Foreshadow[] {
    return this.all.filter(f => f.strength === strength);
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(f => ({
      foreshadowId: f.foreshadowId, clue: f.clue, strength: f.strength,
      plantedIn: f.plantedIn, plantedChapter: f.plantedChapter, plantedScene: f.plantedScene,
      hints: [...f.hints], references: f.references.map(r => r.toJSON()),
      payoff: f.payoff.toJSON(), notes: f.notes,
    }))};
  }
}
