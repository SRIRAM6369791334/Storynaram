import { ValueObject } from '@storynaram/domain-kernel';

export class LanguageCode extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Language code cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Language {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: LanguageCode,
    public readonly isConstructed: boolean = false,
  ) {
    if (name.trim().length === 0) throw new Error('Language name cannot be empty');
  }
}

export class CurrencyCode extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Currency code cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Currency {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: CurrencyCode,
    public readonly symbol: string,
    public readonly subunit?: string,
  ) {
    if (name.trim().length === 0) throw new Error('Currency name cannot be empty');
  }
}

export class Religion {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly deityNames: string[],
    public readonly isPolytheistic: boolean = true,
  ) {
    if (name.trim().length === 0) throw new Error('Religion name cannot be empty');
  }
}

export class Culture {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly languageIds: string[],
    public readonly values: string[],
    public readonly traditions: string[],
  ) {
    if (name.trim().length === 0) throw new Error('Culture name cannot be empty');
  }
}

export class WorldCultures extends ValueObject {
  private readonly items: Map<string, Culture>;

  constructor(cultures: Culture[] = []) {
    super();
    this.items = new Map();
    for (const c of cultures) {
      this.items.set(c.id, c);
    }
  }

  get all(): readonly Culture[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): Culture | undefined {
    return this.items.get(id);
  }

  add(culture: Culture): WorldCultures {
    const next = new Map(this.items);
    next.set(culture.id, culture);
    return new WorldCultures(Array.from(next.values()));
  }

  remove(id: string): WorldCultures {
    const next = new Map(this.items);
    next.delete(id);
    return new WorldCultures(Array.from(next.values()));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      languageIds: c.languageIds,
      values: c.values,
      traditions: c.traditions,
    }))};
  }
}
