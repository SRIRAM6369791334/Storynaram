export interface PlanningStats {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  cancelledSessions: number;
  averageDurationMs: number;
  totalStagesCompleted: number;
  stageCounts: Record<string, number>;
  averageStagesPerSession: number;
  successRate: number;
}

export interface StageTiming {
  stage: string;
  minMs: number;
  maxMs: number;
  avgMs: number;
  count: number;
}

export class PlanningStatistics {
  private readonly stageTimings = new Map<string, number[]>();
  private sessionCount = 0;
  private completedCount = 0;
  private failedCount = 0;
  private cancelledCount = 0;
  private totalDurationMs = 0;
  private totalStages = 0;

  recordSessionStarted(): void {
    this.sessionCount++;
  }

  recordSessionCompleted(durationMs: number, stagesCompleted: number): void {
    this.completedCount++;
    this.totalDurationMs += durationMs;
    this.totalStages += stagesCompleted;
  }

  recordSessionFailed(): void {
    this.failedCount++;
  }

  recordSessionCancelled(): void {
    this.cancelledCount++;
  }

  recordStageTiming(stage: string, durationMs: number): void {
    const timings = this.stageTimings.get(stage) ?? [];
    timings.push(durationMs);
    this.stageTimings.set(stage, timings);
  }

  getSummary(): PlanningStats {
    const totalFinished = this.completedCount + this.failedCount + this.cancelledCount;

    return {
      totalSessions: this.sessionCount,
      completedSessions: this.completedCount,
      failedSessions: this.failedCount,
      cancelledSessions: this.cancelledCount,
      averageDurationMs: this.completedCount > 0
        ? Math.round(this.totalDurationMs / this.completedCount)
        : 0,
      totalStagesCompleted: this.totalStages,
      stageCounts: this.getStageCounts(),
      averageStagesPerSession: this.completedCount > 0
        ? Math.round(this.totalStages / this.completedCount)
        : 0,
      successRate: this.sessionCount > 0
        ? Math.round((this.completedCount / this.sessionCount) * 100)
        : 0,
    };
  }

  getStageTimings(): StageTiming[] {
    return Array.from(this.stageTimings.entries()).map(([stage, timings]) => ({
      stage,
      minMs: Math.min(...timings),
      maxMs: Math.max(...timings),
      avgMs: timings.length > 0
        ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length)
        : 0,
      count: timings.length,
    }));
  }

  private getStageCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [stage, timings] of this.stageTimings) {
      counts[stage] = timings.length;
    }
    return counts;
  }

  reset(): void {
    this.stageTimings.clear();
    this.sessionCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.cancelledCount = 0;
    this.totalDurationMs = 0;
    this.totalStages = 0;
  }
}
