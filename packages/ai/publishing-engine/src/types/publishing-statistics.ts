export interface PubStats {
  totalDurationMs: number;
  chaptersProcessed: number;
  formatsRendered: number;
  formatsExported: number;
  totalOutputSize: number;
  pagesEstimated: number;
  tocEntries: number;
}

export class PublishingStatistics {
  private startTime: number = 0;
  private stageLatencies: Map<string, number> = new Map();
  private formatSizes: Map<string, number> = new Map();
  private tocEntryCount: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  recordStage(stage: string, latencyMs: number): void {
    this.stageLatencies.set(stage, (this.stageLatencies.get(stage) ?? 0) + latencyMs);
  }

  recordFormat(format: string, size: number): void {
    this.formatSizes.set(format, size);
  }

  setTocEntryCount(count: number): void {
    this.tocEntryCount = count;
  }

  getStats(chaptersProcessed: number, formatsRendered: number, formatsExported: number): PubStats {
    const totalDuration = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const totalOutputSize = Array.from(this.formatSizes.values()).reduce((a, b) => a + b, 0);
    const pagesEstimated = Math.ceil(totalOutputSize / 2500);

    return {
      totalDurationMs: totalDuration,
      chaptersProcessed,
      formatsRendered,
      formatsExported,
      totalOutputSize,
      pagesEstimated,
      tocEntries: this.tocEntryCount,
    };
  }
}
