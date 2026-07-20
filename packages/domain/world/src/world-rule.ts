import { ValueObject } from '@storynaram/domain-kernel';

export type RuleCategory = 'physical' | 'magical' | 'social' | 'environmental' | 'temporal' | 'cosmic';

export class WorldRule {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: RuleCategory,
    public readonly isActive: boolean = true,
  ) {
    if (name.trim().length === 0) throw new Error('Rule name cannot be empty');
  }

  deactivate(): WorldRule {
    return new WorldRule(this.id, this.name, this.description, this.category, false);
  }

  activate(): WorldRule {
    return new WorldRule(this.id, this.name, this.description, this.category, true);
  }
}

export class WorldRules extends ValueObject {
  private readonly items: Map<string, WorldRule>;

  constructor(rules: WorldRule[] = []) {
    super();
    this.items = new Map();
    for (const r of rules) {
      this.items.set(r.id, r);
    }
  }

  get all(): readonly WorldRule[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): WorldRule | undefined {
    return this.items.get(id);
  }

  add(rule: WorldRule): WorldRules {
    const next = new Map(this.items);
    next.set(rule.id, rule);
    return new WorldRules(Array.from(next.values()));
  }

  remove(id: string): WorldRules {
    const next = new Map(this.items);
    next.delete(id);
    return new WorldRules(Array.from(next.values()));
  }

  byCategory(category: RuleCategory): WorldRule[] {
    return this.all.filter(r => r.category === category);
  }

  active(): WorldRule[] {
    return this.all.filter(r => r.isActive);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      isActive: r.isActive,
    }))};
  }
}
