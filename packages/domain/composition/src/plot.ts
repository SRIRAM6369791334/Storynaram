import { ValueObject } from '@storynaram/domain-kernel';

export type PlotStage =
  | 'setup' | 'incitingIncident' | 'risingAction' | 'midpoint'
  | 'crisis' | 'climax' | 'fallingAction' | 'resolution';

export type PlotStructure =
  | 'threeAct' | 'fiveAct' | 'heroJourney' | 'saveTheCat' | 'nonLinear' | 'openWorld' | 'sandbox';

export type PlotType = 'linear' | 'branching' | 'openWorld' | 'sandbox';

export class PlotPoint {
  constructor(
    public readonly pointId: string,
    public readonly stage: PlotStage,
    public readonly chapterId: string,
    public readonly sceneId: string,
    public readonly title: string = '',
    public readonly summary: string = '',
    public readonly narrativeRefs: readonly string[] = [],
    public readonly timelineRefs: readonly string[] = [],
    public readonly conflictIds: readonly string[] = [],
    public readonly order: number = 0,
  ) {
    if (pointId.trim().length === 0) throw new Error('PlotPoint ID cannot be empty');
    if (chapterId.trim().length === 0) throw new Error('PlotPoint chapter ID cannot be empty');
    if (sceneId.trim().length === 0) throw new Error('PlotPoint scene ID cannot be empty');
  }
}

export class PlotPointCollection extends ValueObject {
  private readonly items: Map<string, PlotPoint>;

  constructor(points: PlotPoint[] = []) {
    super();
    this.items = new Map();
    for (const p of points) {
      this.items.set(p.pointId, p);
    }
  }

  get all(): readonly PlotPoint[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): PlotPoint | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(point: PlotPoint): PlotPointCollection {
    const next = new Map(this.items);
    next.set(point.pointId, point);
    return new PlotPointCollection(Array.from(next.values()));
  }

  remove(id: string): PlotPointCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new PlotPointCollection(Array.from(next.values()));
  }

  ofStage(stage: PlotStage): PlotPoint[] {
    return this.all.filter(p => p.stage === stage);
  }

  ofChapter(chapterId: string): PlotPoint[] {
    return this.all.filter(p => p.chapterId === chapterId);
  }

  sorted(): PlotPoint[] {
    return [...this.all].sort((a, b) => a.order - b.order);
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(p => ({
      pointId: p.pointId, stage: p.stage, chapterId: p.chapterId,
      sceneId: p.sceneId, title: p.title, summary: p.summary,
      narrativeRefs: [...p.narrativeRefs], timelineRefs: [...p.timelineRefs],
      conflictIds: [...p.conflictIds], order: p.order,
    }))};
  }
}

export class Plot extends ValueObject {
  constructor(
    public readonly structure: PlotStructure = 'threeAct',
    public readonly plotType: PlotType = 'linear',
    public readonly points: PlotPointCollection = new PlotPointCollection(),
    public readonly description: string = '',
    public readonly plotId: string = '',
  ) {
    super();
  }

  get totalPoints(): number { return this.points.count; }

  protected getEqualityComponents(): unknown[] {
    return [this.structure, this.plotType, this.totalPoints];
  }

  toJSON(): Record<string, unknown> {
    return {
      structure: this.structure, plotType: this.plotType,
      points: this.points.toJSON(), description: this.description, plotId: this.plotId,
    };
  }
}

export class PlotProgress extends ValueObject {
  constructor(
    public readonly completedPoints: number = 0,
    public readonly totalPoints: number = 0,
    public readonly currentStage: PlotStage = 'setup',
  ) {
    super();
  }

  get percentage(): number {
    if (this.totalPoints === 0) return 0;
    return Math.round((this.completedPoints / this.totalPoints) * 100);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.completedPoints, this.totalPoints];
  }

  toJSON(): Record<string, unknown> {
    return {
      completedPoints: this.completedPoints, totalPoints: this.totalPoints,
      currentStage: this.currentStage, percentage: this.percentage,
    };
  }
}

export class PlotStatistics extends ValueObject {
  constructor(
    public readonly totalBranches: number = 0,
    public readonly activeBranches: number = 0,
    public readonly convergencePoints: number = 0,
    public readonly averageBranchDepth: number = 0,
    public readonly maxConcurrentBranches: number = 0,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalBranches, this.activeBranches, this.convergencePoints];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalBranches: this.totalBranches, activeBranches: this.activeBranches,
      convergencePoints: this.convergencePoints, averageBranchDepth: this.averageBranchDepth,
      maxConcurrentBranches: this.maxConcurrentBranches,
    };
  }
}
