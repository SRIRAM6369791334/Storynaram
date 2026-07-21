export interface RevStats {
  totalDurationMs: number;
  chaptersRevised: number;
  totalIssuesFound: number;
  totalIssuesResolved: number;
  totalChanges: number;
  averageLatencyMs: number;
  passesCompleted: number;
  passesFailed: number;
  overallQualityImprovement: number;
  qualityScoreBefore: number;
  qualityScoreAfter: number;
}

export class RevisionStatistics {
  private startTime: number = 0;
  private passLatencies: number[] = [];
  private passResults: Array<{ name: string; issuesFound: number; issuesResolved: number }> = [];
  private totalIssuesFound: number = 0;
  private totalIssuesResolved: number = 0;
  private qualityScoreBefore: number = 0;
  private qualityScoreAfter: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  recordPass(passName: string, latencyMs: number, issuesFound: number, issuesResolved: number): void {
    this.passLatencies.push(latencyMs);
    this.passResults.push({ name: passName, issuesFound, issuesResolved });
    this.totalIssuesFound += issuesFound;
    this.totalIssuesResolved += issuesResolved;
  }

  setQualityScores(before: number, after: number): void {
    this.qualityScoreBefore = before;
    this.qualityScoreAfter = after;
  }

  getStats(chaptersRevised: number): RevStats {
    const totalDuration = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const avgLatency = this.passLatencies.length > 0
      ? this.passLatencies.reduce((a, b) => a + b, 0) / this.passLatencies.length
      : 0;

    return {
      totalDurationMs: totalDuration,
      chaptersRevised,
      totalIssuesFound: this.totalIssuesFound,
      totalIssuesResolved: this.totalIssuesResolved,
      totalChanges: this.passResults.reduce((a, p) => a + p.issuesResolved, 0),
      averageLatencyMs: avgLatency,
      passesCompleted: this.passResults.length,
      passesFailed: 0,
      overallQualityImprovement: this.qualityScoreAfter - this.qualityScoreBefore,
      qualityScoreBefore: this.qualityScoreBefore,
      qualityScoreAfter: this.qualityScoreAfter,
    };
  }
}
