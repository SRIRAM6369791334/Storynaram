export interface GenStats {
  totalDurationMs: number;
  chaptersGenerated: number;
  totalTokens: { inputTokens: number; outputTokens: number; totalTokens: number };
  averageLatencyMs: number;
  modelUsage: Record<string, number>;
  providerUsage: Record<string, number>;
  retryCount: number;
  qualityScore: number;
}

export class GenerationStatistics {
  private startTime: number = 0;
  private chapterLatencies: number[] = [];
  private chapterTokens: Array<{ input: number; output: number; total: number }> = [];
  private modelUsage: Map<string, number> = new Map();
  private providerUsage: Map<string, number> = new Map();
  private retryCount: number = 0;
  private qualityScore: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  recordChapterGeneration(latencyMs: number, tokens: { input: number; output: number; total: number }, model: string, provider: string): void {
    this.chapterLatencies.push(latencyMs);
    this.chapterTokens.push(tokens);
    this.modelUsage.set(model, (this.modelUsage.get(model) ?? 0) + 1);
    this.providerUsage.set(provider, (this.providerUsage.get(provider) ?? 0) + 1);
  }

  incrementRetry(): void {
    this.retryCount++;
  }

  setQualityScore(score: number): void {
    this.qualityScore = score;
  }

  getStats(chaptersGenerated: number): GenStats {
    const totalDuration = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const total = this.chapterTokens.reduce(
      (acc, t) => ({ input: acc.input + t.input, output: acc.output + t.output, total: acc.total + t.total }),
      { input: 0, output: 0, total: 0 },
    );
    const totalTokens = { inputTokens: total.input, outputTokens: total.output, totalTokens: total.total };
    const avgLatency = this.chapterLatencies.length > 0
      ? this.chapterLatencies.reduce((a, b) => a + b, 0) / this.chapterLatencies.length
      : 0;

    return {
      totalDurationMs: totalDuration,
      chaptersGenerated,
      totalTokens,
      averageLatencyMs: avgLatency,
      modelUsage: Object.fromEntries(this.modelUsage),
      providerUsage: Object.fromEntries(this.providerUsage),
      retryCount: this.retryCount,
      qualityScore: this.qualityScore,
    };
  }
}
