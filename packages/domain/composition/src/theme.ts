import { ValueObject } from '@storynaram/domain-kernel';

export type ThemeCategory =
  | 'love' | 'death' | 'power' | 'justice' | 'revenge' | 'redemption' | 'sacrifice'
  | 'identity' | 'freedom' | 'betrayal' | 'courage' | 'hope' | 'despair' | 'family'
  | 'friendship' | 'honor' | 'duty' | 'faith' | 'truth' | 'deception' | 'greed'
  | 'ambition' | 'forgiveness' | 'transformation' | 'survival' | 'other';

export class ThemeProgress extends ValueObject {
  constructor(
    public readonly introduced: boolean = false,
    public readonly developed: boolean = false,
    public readonly challenged: boolean = false,
    public readonly resolved: boolean = false,
  ) {
    super();
  }

  advance(): ThemeProgress {
    if (!this.introduced) return new ThemeProgress(true, false, false, false);
    if (!this.developed) return new ThemeProgress(true, true, false, false);
    if (!this.challenged) return new ThemeProgress(true, true, true, false);
    return new ThemeProgress(true, true, true, true);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.introduced, this.developed, this.challenged, this.resolved];
  }

  toJSON(): Record<string, unknown> {
    return { introduced: this.introduced, developed: this.developed, challenged: this.challenged, resolved: this.resolved };
  }
}

export class ThemeEvidence extends ValueObject {
  constructor(
    public readonly text: string = '',
    public readonly sourceId: string = '',
    public readonly chapterId: string = '',
    public readonly sceneId: string = '',
    public readonly strength: number = 1,
  ) {
    super();
    if (strength < 1 || strength > 10) throw new Error('ThemeEvidence strength must be 1-10');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.text.toLowerCase(), this.sourceId, this.strength];
  }

  toJSON(): Record<string, unknown> {
    return { text: this.text, sourceId: this.sourceId, chapterId: this.chapterId, sceneId: this.sceneId, strength: this.strength };
  }
}

export class ThemeResolution extends ValueObject {
  constructor(
    public readonly resolved: boolean = false,
    public readonly statement: string = '',
    public readonly reinforces: boolean = true,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.resolved, this.statement.toLowerCase(), this.reinforces];
  }

  toJSON(): Record<string, unknown> {
    return { resolved: this.resolved, statement: this.statement, reinforces: this.reinforces };
  }
}

export class Theme {
  constructor(
    public readonly themeId: string,
    public readonly category: ThemeCategory,
    public readonly statement: string,
    public readonly subThemes: readonly string[] = [],
    public readonly progress: ThemeProgress = new ThemeProgress(),
    public readonly evidence: readonly ThemeEvidence[] = [],
    public readonly resolution: ThemeResolution = new ThemeResolution(),
  ) {
    if (themeId.trim().length === 0) throw new Error('Theme ID cannot be empty');
    if (statement.trim().length === 0) throw new Error('Theme statement cannot be empty');
  }
}

export class ThemeCollection extends ValueObject {
  private readonly items: Map<string, Theme>;

  constructor(themes: Theme[] = []) {
    super();
    this.items = new Map();
    for (const t of themes) {
      this.items.set(t.themeId, t);
    }
  }

  get all(): readonly Theme[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Theme | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(theme: Theme): ThemeCollection {
    const next = new Map(this.items);
    next.set(theme.themeId, theme);
    return new ThemeCollection(Array.from(next.values()));
  }

  remove(id: string): ThemeCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new ThemeCollection(Array.from(next.values()));
  }

  ofCategory(category: ThemeCategory): Theme[] {
    return this.all.filter(t => t.category === category);
  }

  resolved(): Theme[] {
    return this.all.filter(t => t.resolution.resolved);
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(t => ({
      themeId: t.themeId, category: t.category, statement: t.statement,
      subThemes: [...t.subThemes], progress: t.progress.toJSON(),
      evidence: t.evidence.map(e => e.toJSON()), resolution: t.resolution.toJSON(),
    }))};
  }
}
