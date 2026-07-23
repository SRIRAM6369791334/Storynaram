import { ValueObject } from '@storynaram/domain-kernel';
import { AnalysisReport } from './composition-analyzer.js';

export interface CompositionStatisticsProps {
  totalAnalyses?: number;
  lastAnalysis?: AnalysisReport | null;
  averageViolations?: number;
  totalViolations?: number;
  storiesValidated?: number;
  storiesWithIssues?: number;
}

export class CompositionStatistics extends ValueObject {
  public readonly totalAnalyses: number;
  public readonly lastAnalysis: AnalysisReport | null;
  public readonly averageViolations: number;
  public readonly totalViolations: number;
  public readonly storiesValidated: number;
  public readonly storiesWithIssues: number;

  constructor(props: CompositionStatisticsProps = {}) {
    super();
    this.totalAnalyses = props.totalAnalyses ?? 0;
    this.lastAnalysis = props.lastAnalysis ?? null;
    this.averageViolations = props.averageViolations ?? 0;
    this.totalViolations = props.totalViolations ?? 0;
    this.storiesValidated = props.storiesValidated ?? 0;
    this.storiesWithIssues = props.storiesWithIssues ?? 0;
  }

  recordAnalysis(violationCount: number, report: AnalysisReport): CompositionStatistics {
    return new CompositionStatistics({
      totalAnalyses: this.totalAnalyses + 1,
      lastAnalysis: report,
      averageViolations: Math.round((this.totalViolations + violationCount) / (this.storiesValidated + 1)),
      totalViolations: this.totalViolations + violationCount,
      storiesValidated: this.storiesValidated + 1,
      storiesWithIssues: violationCount > 0 ? this.storiesWithIssues + 1 : this.storiesWithIssues,
    });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalAnalyses, this.totalViolations, this.storiesValidated];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalAnalyses: this.totalAnalyses, lastAnalysis: this.lastAnalysis,
      averageViolations: this.averageViolations, totalViolations: this.totalViolations,
      storiesValidated: this.storiesValidated, storiesWithIssues: this.storiesWithIssues,
    };
  }
}
