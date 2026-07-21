import { ValueObject } from '@storynaram/domain-kernel';

export type ArcStage =
  | 'introduction' | 'rising' | 'climax' | 'falling' | 'resolution' | 'completed';

export type ArcGoalType =
  | 'external' | 'internal' | 'relationship' | 'survival' | 'discovery' | 'transformation';

export type ArcResolutionType =
  | 'success' | 'failure' | 'partial' | 'ambiguous' | 'bittersweet' | 'tragic';

export class ArcGoal extends ValueObject {
  constructor(
    public readonly description: string,
    public readonly goalType: ArcGoalType = 'external',
    public readonly isAchieved: boolean = false,
  ) {
    super();
    if (description.trim().length === 0) throw new Error('ArcGoal description cannot be empty');
  }

  achieved(): ArcGoal {
    return new ArcGoal(this.description, this.goalType, true);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.description.toLowerCase(), this.goalType, this.isAchieved];
  }

  toJSON(): Record<string, unknown> {
    return { description: this.description, goalType: this.goalType, isAchieved: this.isAchieved };
  }
}

export class ArcResolution extends ValueObject {
  constructor(
    public readonly resolutionType: ArcResolutionType = 'ambiguous',
    public readonly description: string = '',
    public readonly satisfied: boolean = false,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.resolutionType, this.description.toLowerCase(), this.satisfied];
  }

  toJSON(): Record<string, unknown> {
    return { resolutionType: this.resolutionType, description: this.description, satisfied: this.satisfied };
  }
}

export class ArcTransition extends ValueObject {
  constructor(
    public readonly fromStage: ArcStage,
    public readonly toStage: ArcStage,
    public readonly trigger: string = '',
    public readonly description: string = '',
  ) {
    super();
    if (fromStage === toStage) throw new Error('ArcTransition must change stage');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.fromStage, this.toStage, this.trigger.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { fromStage: this.fromStage, toStage: this.toStage, trigger: this.trigger, description: this.description };
  }
}

export class StoryArc {
  constructor(
    public readonly arcId: string,
    public readonly name: string,
    public readonly stage: ArcStage = 'introduction',
    public readonly goal: ArcGoal = new ArcGoal('Complete arc'),
    public readonly resolution: ArcResolution = new ArcResolution(),
    public readonly transitions: readonly ArcTransition[] = [],
    public readonly characterIds: readonly string[] = [],
    public readonly plotPointIds: readonly string[] = [],
    public readonly description: string = '',
  ) {
    if (arcId.trim().length === 0) throw new Error('StoryArc ID cannot be empty');
    if (name.trim().length === 0) throw new Error('StoryArc name cannot be empty');
  }
}

export class ArcCollection extends ValueObject {
  private readonly items: Map<string, StoryArc>;

  constructor(arcs: StoryArc[] = []) {
    super();
    this.items = new Map();
    for (const a of arcs) {
      this.items.set(a.arcId, a);
    }
  }

  get all(): readonly StoryArc[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): StoryArc | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(arc: StoryArc): ArcCollection {
    const next = new Map(this.items);
    next.set(arc.arcId, arc);
    return new ArcCollection(Array.from(next.values()));
  }

  remove(id: string): ArcCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new ArcCollection(Array.from(next.values()));
  }

  ofStage(stage: ArcStage): StoryArc[] {
    return this.all.filter(a => a.stage === stage);
  }

  completed(): StoryArc[] {
    return this.all.filter(a => a.stage === 'completed' || a.resolution.satisfied);
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(a => ({
      arcId: a.arcId, name: a.name, stage: a.stage,
      goal: a.goal.toJSON(), resolution: a.resolution.toJSON(),
      transitions: a.transitions.map(t => t.toJSON()),
      characterIds: [...a.characterIds], plotPointIds: [...a.plotPointIds],
      description: a.description,
    }))};
  }
}
