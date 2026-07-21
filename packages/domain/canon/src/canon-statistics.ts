import { ValueObject } from '@storynaram/domain-kernel';

export interface CanonStatisticsProps {
  totalEntries?: number;
  activeEntries?: number;
  conflictedEntries?: number;
  deprecatedEntries?: number;
  draftEntries?: number;
  publishedEntries?: number;
  totalConflicts?: number;
  unresolvedConflicts?: number;
  totalFacts?: number;
  factTypeDistribution?: Record<string, number>;
}

export class CanonStatistics extends ValueObject {
  public readonly totalEntries: number;
  public readonly activeEntries: number;
  public readonly conflictedEntries: number;
  public readonly deprecatedEntries: number;
  public readonly draftEntries: number;
  public readonly publishedEntries: number;
  public readonly totalConflicts: number;
  public readonly unresolvedConflicts: number;
  public readonly totalFacts: number;
  public readonly factTypeDistribution: Record<string, number>;

  constructor(props: CanonStatisticsProps = {}) {
    super();
    this.totalEntries = props.totalEntries ?? 0;
    this.activeEntries = props.activeEntries ?? 0;
    this.conflictedEntries = props.conflictedEntries ?? 0;
    this.deprecatedEntries = props.deprecatedEntries ?? 0;
    this.draftEntries = props.draftEntries ?? 0;
    this.publishedEntries = props.publishedEntries ?? 0;
    this.totalConflicts = props.totalConflicts ?? 0;
    this.unresolvedConflicts = props.unresolvedConflicts ?? 0;
    this.totalFacts = props.totalFacts ?? 0;
    this.factTypeDistribution = props.factTypeDistribution ?? {};

    if (this.totalEntries < 0) throw new Error('Total entries cannot be negative');
    if (this.totalConflicts < 0) throw new Error('Total conflicts cannot be negative');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalEntries, this.totalConflicts, this.unresolvedConflicts];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalEntries: this.totalEntries,
      activeEntries: this.activeEntries,
      conflictedEntries: this.conflictedEntries,
      deprecatedEntries: this.deprecatedEntries,
      draftEntries: this.draftEntries,
      publishedEntries: this.publishedEntries,
      totalConflicts: this.totalConflicts,
      unresolvedConflicts: this.unresolvedConflicts,
      totalFacts: this.totalFacts,
      factTypeDistribution: { ...this.factTypeDistribution },
    };
  }
}
