import { ValueObject } from '@storynaram/domain-kernel';

export type CharacterGrowthType =
  | 'positive' | 'negative' | 'static' | 'redemption' | 'corruption' | 'transformation';

export type CharacterConflictType =
  | 'internal' | 'interpersonal' | 'situational' | 'moral';

export class CharacterGoal extends ValueObject {
  constructor(
    public readonly description: string,
    public readonly priority: number = 1,
    public readonly isAchieved: boolean = false,
    public readonly relatedConflictId: string = '',
  ) {
    super();
    if (description.trim().length === 0) throw new Error('CharacterGoal description cannot be empty');
  }

  achieved(): CharacterGoal {
    return new CharacterGoal(this.description, this.priority, true, this.relatedConflictId);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.description.toLowerCase(), this.priority, this.isAchieved];
  }

  toJSON(): Record<string, unknown> {
    return { description: this.description, priority: this.priority, isAchieved: this.isAchieved, relatedConflictId: this.relatedConflictId };
  }
}

export class CharacterConflict extends ValueObject {
  constructor(
    public readonly conflictType: CharacterConflictType = 'internal',
    public readonly description: string = '',
    public readonly isResolved: boolean = false,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.conflictType, this.description.toLowerCase(), this.isResolved];
  }

  toJSON(): Record<string, unknown> {
    return { conflictType: this.conflictType, description: this.description, isResolved: this.isResolved };
  }
}

export class CharacterGrowth extends ValueObject {
  constructor(
    public readonly growthType: CharacterGrowthType = 'static',
    public readonly description: string = '',
    public readonly magnitude: number = 0,
  ) {
    super();
    if (magnitude < 0 || magnitude > 10) throw new Error('CharacterGrowth magnitude must be 0-10');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.growthType, this.magnitude];
  }

  toJSON(): Record<string, unknown> {
    return { growthType: this.growthType, description: this.description, magnitude: this.magnitude };
  }
}

export class CharacterTransformation extends ValueObject {
  constructor(
    public readonly fromTrait: string = '',
    public readonly toTrait: string = '',
    public readonly trigger: string = '',
    public readonly description: string = '',
    public readonly isComplete: boolean = false,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.fromTrait.toLowerCase(), this.toTrait.toLowerCase(), this.isComplete];
  }

  toJSON(): Record<string, unknown> {
    return { fromTrait: this.fromTrait, toTrait: this.toTrait, trigger: this.trigger, description: this.description, isComplete: this.isComplete };
  }
}

export class CharacterResolution extends ValueObject {
  constructor(
    public readonly resolved: boolean = false,
    public readonly resolution: string = '',
    public readonly satisfiesGoals: boolean = false,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.resolved, this.resolution.toLowerCase(), this.satisfiesGoals];
  }

  toJSON(): Record<string, unknown> {
    return { resolved: this.resolved, resolution: this.resolution, satisfiesGoals: this.satisfiesGoals };
  }
}

export class CharacterArc {
  constructor(
    public readonly characterArcId: string,
    public readonly characterId: string,
    public readonly goals: readonly CharacterGoal[] = [],
    public readonly conflicts: readonly CharacterConflict[] = [],
    public readonly growth: CharacterGrowth = new CharacterGrowth(),
    public readonly transformation: CharacterTransformation = new CharacterTransformation(),
    public readonly resolution: CharacterResolution = new CharacterResolution(),
    public readonly notes: string = '',
  ) {
    if (characterArcId.trim().length === 0) throw new Error('CharacterArc ID cannot be empty');
    if (characterId.trim().length === 0) throw new Error('CharacterArc character ID cannot be empty');
  }
}

export class CharacterArcCollection extends ValueObject {
  private readonly items: Map<string, CharacterArc>;

  constructor(arcs: CharacterArc[] = []) {
    super();
    this.items = new Map();
    for (const a of arcs) {
      this.items.set(a.characterArcId, a);
    }
  }

  get all(): readonly CharacterArc[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): CharacterArc | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(arc: CharacterArc): CharacterArcCollection {
    const next = new Map(this.items);
    next.set(arc.characterArcId, arc);
    return new CharacterArcCollection(Array.from(next.values()));
  }

  remove(id: string): CharacterArcCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new CharacterArcCollection(Array.from(next.values()));
  }

  ofCharacter(characterId: string): CharacterArc[] {
    return this.all.filter(a => a.characterId === characterId);
  }

  resolved(): CharacterArc[] {
    return this.all.filter(a => a.resolution.resolved);
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(a => ({
      characterArcId: a.characterArcId, characterId: a.characterId,
      goals: a.goals.map(g => g.toJSON()),
      conflicts: a.conflicts.map(c => c.toJSON()),
      growth: a.growth.toJSON(), transformation: a.transformation.toJSON(),
      resolution: a.resolution.toJSON(), notes: a.notes,
    }))};
  }
}
