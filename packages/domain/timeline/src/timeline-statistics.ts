import { ValueObject } from '@storynaram/domain-kernel';

export interface TimelineStatisticsProps {
  totalEvents?: number;
  mainBranchEvents?: number;
  branchCount?: number;
  eraCount?: number;
  averageImportance?: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export class TimelineStatistics extends ValueObject {
  public readonly totalEvents: number;
  public readonly mainBranchEvents: number;
  public readonly branchCount: number;
  public readonly eraCount: number;
  public readonly averageImportance: number;
  public readonly dateRangeStart: string;
  public readonly dateRangeEnd: string;

  constructor(props: TimelineStatisticsProps = {}) {
    super();
    this.totalEvents = props.totalEvents ?? 0;
    this.mainBranchEvents = props.mainBranchEvents ?? 0;
    this.branchCount = props.branchCount ?? 1;
    this.eraCount = props.eraCount ?? 0;
    this.averageImportance = props.averageImportance ?? 0;
    this.dateRangeStart = props.dateRangeStart ?? '';
    this.dateRangeEnd = props.dateRangeEnd ?? '';

    if (this.totalEvents < 0) throw new Error('Total events cannot be negative');
    if (this.averageImportance < 0 || this.averageImportance > 100) throw new Error('Average importance must be 0-100');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalEvents, this.mainBranchEvents, this.branchCount, this.eraCount, this.averageImportance];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalEvents: this.totalEvents,
      mainBranchEvents: this.mainBranchEvents,
      branchCount: this.branchCount,
      eraCount: this.eraCount,
      averageImportance: this.averageImportance,
      dateRangeStart: this.dateRangeStart,
      dateRangeEnd: this.dateRangeEnd,
    };
  }
}
