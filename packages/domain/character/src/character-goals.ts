import { ValueObject, Timestamp } from '@storynaram/domain-kernel';

export enum GoalType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM',
  PERSONAL = 'PERSONAL',
  QUEST = 'QUEST',
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
}

export class CharacterGoal {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly type: GoalType,
    public status: GoalStatus = GoalStatus.ACTIVE,
    public readonly deadline?: Timestamp,
  ) {}

  complete(): void {
    this.status = GoalStatus.COMPLETED;
  }

  fail(): void {
    this.status = GoalStatus.FAILED;
  }

  abandon(): void {
    this.status = GoalStatus.ABANDONED;
  }
}

export class CharacterGoals extends ValueObject {
  private readonly items: Map<string, CharacterGoal>;

  constructor(goals: CharacterGoal[] = []) {
    super();
    this.items = new Map();
    for (const goal of goals) {
      this.items.set(goal.id, goal);
    }
  }

  get all(): readonly CharacterGoal[] {
    return Array.from(this.items.values());
  }

  get active(): CharacterGoal[] {
    return this.all.filter(g => g.status === GoalStatus.ACTIVE);
  }

  get completed(): CharacterGoal[] {
    return this.all.filter(g => g.status === GoalStatus.COMPLETED);
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): CharacterGoal | undefined {
    return this.items.get(id);
  }

  add(goal: CharacterGoal): CharacterGoals {
    const next = new Map(this.items);
    next.set(goal.id, goal);
    return new CharacterGoals(Array.from(next.values()));
  }

  complete(id: string): CharacterGoals {
    const goal = this.items.get(id);
    if (!goal) return this;
    goal.complete();
    return new CharacterGoals(Array.from(this.items.values()));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown>[] {
    return this.all.map(g => ({
      id: g.id,
      description: g.description,
      type: g.type,
      status: g.status,
      deadline: g.deadline?.toJSON(),
    }));
  }
}
