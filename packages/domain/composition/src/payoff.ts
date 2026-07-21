import { ValueObject } from '@storynaram/domain-kernel';

export class Resolution extends ValueObject {
  constructor(
    public readonly resolved: boolean = false,
    public readonly description: string = '',
    public readonly chapterId: string = '',
    public readonly sceneId: string = '',
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.resolved, this.description.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { resolved: this.resolved, description: this.description, chapterId: this.chapterId, sceneId: this.sceneId };
  }
}

export class Reward extends ValueObject {
  constructor(
    public readonly type: string = 'emotional',
    public readonly description: string = '',
    public readonly value: number = 1,
  ) {
    super();
    if (value < 0) throw new Error('Reward value cannot be negative');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.type, this.description.toLowerCase(), this.value];
  }

  toJSON(): Record<string, unknown> {
    return { type: this.type, description: this.description, value: this.value };
  }
}

export class Consequence extends ValueObject {
  constructor(
    public readonly type: string = 'narrative',
    public readonly description: string = '',
    public readonly severity: number = 1,
  ) {
    super();
    if (severity < 0 || severity > 10) throw new Error('Consequence severity must be 0-10');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.type, this.description.toLowerCase(), this.severity];
  }

  toJSON(): Record<string, unknown> {
    return { type: this.type, description: this.description, severity: this.severity };
  }
}

export class Payoff {
  constructor(
    public readonly payoffId: string,
    public readonly foreshadowId: string,
    public readonly description: string,
    public readonly resolution: Resolution = new Resolution(),
    public readonly reward: Reward = new Reward(),
    public readonly consequence: Consequence = new Consequence(),
    public readonly characterIds: readonly string[] = [],
    public readonly chapterId: string = '',
    public readonly sceneId: string = '',
  ) {
    if (payoffId.trim().length === 0) throw new Error('Payoff ID cannot be empty');
    if (foreshadowId.trim().length === 0) throw new Error('Payoff foreshadow ID cannot be empty');
    if (description.trim().length === 0) throw new Error('Payoff description cannot be empty');
  }
}

export class PayoffCollection extends ValueObject {
  private readonly items: Map<string, Payoff>;

  constructor(items: Payoff[] = []) {
    super();
    this.items = new Map();
    for (const p of items) {
      this.items.set(p.payoffId, p);
    }
  }

  get all(): readonly Payoff[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Payoff | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(item: Payoff): PayoffCollection {
    const next = new Map(this.items);
    next.set(item.payoffId, item);
    return new PayoffCollection(Array.from(next.values()));
  }

  remove(id: string): PayoffCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new PayoffCollection(Array.from(next.values()));
  }

  ofForeshadow(foreshadowId: string): Payoff[] {
    return this.all.filter(p => p.foreshadowId === foreshadowId);
  }

  resolved(): Payoff[] {
    return this.all.filter(p => p.resolution.resolved);
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(p => ({
      payoffId: p.payoffId, foreshadowId: p.foreshadowId, description: p.description,
      resolution: p.resolution.toJSON(), reward: p.reward.toJSON(),
      consequence: p.consequence.toJSON(), characterIds: [...p.characterIds],
      chapterId: p.chapterId, sceneId: p.sceneId,
    }))};
  }
}
