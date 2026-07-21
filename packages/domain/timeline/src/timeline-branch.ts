import { ValueObject } from '@storynaram/domain-kernel';
import { TimelineDate } from './timeline-date';

export class TimelineBranch {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly createdAt: TimelineDate,
    public readonly parentBranchId?: string,
    public readonly isActive: boolean = true,
    public readonly isMerged: boolean = false,
  ) {
    if (name.trim().length === 0) throw new Error('Branch name cannot be empty');
  }

  isMain(): boolean {
    return this.id === 'main';
  }
}

export class TimelineBranches extends ValueObject {
  private readonly items: Map<string, TimelineBranch>;

  constructor(branches: TimelineBranch[] = []) {
    super();
    this.items = new Map();
    const main = branches.find(b => b.isMain()) ?? new TimelineBranch('main', 'Main', 'Primary timeline', new TimelineDate(1, 1, 1, 'CE'));
    this.items.set('main', main);
    for (const b of branches) {
      if (b.id !== 'main') this.items.set(b.id, b);
    }
  }

  get all(): readonly TimelineBranch[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get main(): TimelineBranch {
    return this.items.get('main')!;
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  get(id: string): TimelineBranch | undefined {
    return this.items.get(id);
  }

  add(branch: TimelineBranch): TimelineBranches {
    const next = new Map(this.items);
    next.set(branch.id, branch);
    return new TimelineBranches(Array.from(next.values()));
  }

  archive(id: string): TimelineBranches {
    const branch = this.items.get(id);
    if (!branch) return this;
    const updated = new TimelineBranch(branch.id, branch.name, branch.description, branch.createdAt, branch.parentBranchId, false, branch.isMerged);
    const next = new Map(this.items);
    next.set(id, updated);
    return new TimelineBranches(Array.from(next.values()));
  }

  active(): TimelineBranch[] {
    return this.all.filter(b => b.isActive);
  }

  childBranches(parentId: string): TimelineBranch[] {
    return this.all.filter(b => b.parentBranchId === parentId);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(b => ({
      id: b.id, name: b.name, description: b.description,
      createdAt: b.createdAt.toJSON(), parentBranchId: b.parentBranchId,
      isActive: b.isActive, isMerged: b.isMerged,
    }))};
  }
}
