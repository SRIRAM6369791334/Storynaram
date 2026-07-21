import { ValueObject } from '@storynaram/domain-kernel';

export interface StoryStatisticsProps {
  totalPlotPoints?: number;
  totalArcs?: number;
  totalCharacterArcs?: number;
  totalConflicts?: number;
  totalThemes?: number;
  totalForeshadows?: number;
  totalPayoffs?: number;
  totalObjectives?: number;
  resolvedConflicts?: number;
  completedArcs?: number;
  paidOffForeshadows?: number;
  completedObjectives?: number;
}

export class StoryStatistics extends ValueObject {
  public readonly totalPlotPoints: number;
  public readonly totalArcs: number;
  public readonly totalCharacterArcs: number;
  public readonly totalConflicts: number;
  public readonly totalThemes: number;
  public readonly totalForeshadows: number;
  public readonly totalPayoffs: number;
  public readonly totalObjectives: number;
  public readonly resolvedConflicts: number;
  public readonly completedArcs: number;
  public readonly paidOffForeshadows: number;
  public readonly completedObjectives: number;

  constructor(props: StoryStatisticsProps = {}) {
    super();
    this.totalPlotPoints = props.totalPlotPoints ?? 0;
    this.totalArcs = props.totalArcs ?? 0;
    this.totalCharacterArcs = props.totalCharacterArcs ?? 0;
    this.totalConflicts = props.totalConflicts ?? 0;
    this.totalThemes = props.totalThemes ?? 0;
    this.totalForeshadows = props.totalForeshadows ?? 0;
    this.totalPayoffs = props.totalPayoffs ?? 0;
    this.totalObjectives = props.totalObjectives ?? 0;
    this.resolvedConflicts = props.resolvedConflicts ?? 0;
    this.completedArcs = props.completedArcs ?? 0;
    this.paidOffForeshadows = props.paidOffForeshadows ?? 0;
    this.completedObjectives = props.completedObjectives ?? 0;
    if (this.totalPlotPoints < 0) throw new Error('Total plot points cannot be negative');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalPlotPoints, this.totalArcs, this.totalConflicts];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalPlotPoints: this.totalPlotPoints, totalArcs: this.totalArcs,
      totalCharacterArcs: this.totalCharacterArcs, totalConflicts: this.totalConflicts,
      totalThemes: this.totalThemes, totalForeshadows: this.totalForeshadows,
      totalPayoffs: this.totalPayoffs, totalObjectives: this.totalObjectives,
      resolvedConflicts: this.resolvedConflicts, completedArcs: this.completedArcs,
      paidOffForeshadows: this.paidOffForeshadows, completedObjectives: this.completedObjectives,
    };
  }
}
