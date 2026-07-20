import { Injectable } from '@nestjs/common';

interface QueryTiming {
  count: number;
  totalMs: number;
  maxMs: number;
  minMs: number;
}

@Injectable()
export class MetricsCollector {
  private queryCount = 0;
  private readCount = 0;
  private writeCount = 0;
  private transactionCount = 0;
  private errorCount = 0;
  private readonly queryDurations: number[] = [];
  private readonly slowQueryThresholdMs: number;
  private slowQueryCount = 0;
  private readonly timings = new Map<string, QueryTiming>();
  private startTime = Date.now();

  constructor(slowQueryThresholdMs = 500) {
    this.slowQueryThresholdMs = slowQueryThresholdMs;
  }

  recordQuery(durationMs: number): void {
    this.queryCount++;
    this.queryDurations.push(durationMs);
    if (durationMs > this.slowQueryThresholdMs) {
      this.slowQueryCount++;
    }
  }

  recordRead(count = 1): void { this.readCount += count; }
  recordWrite(count = 1): void { this.writeCount += count; }
  recordTransaction(): void { this.transactionCount++; }
  recordError(): void { this.errorCount++; }

  recordTiming(label: string, durationMs: number): void {
    const existing = this.timings.get(label);
    if (existing) {
      existing.count++;
      existing.totalMs += durationMs;
      existing.maxMs = Math.max(existing.maxMs, durationMs);
      existing.minMs = Math.min(existing.minMs, durationMs);
    } else {
      this.timings.set(label, { count: 1, totalMs: durationMs, maxMs: durationMs, minMs: durationMs });
    }
  }

  getMetrics() {
    const totalDuration = this.queryDurations.reduce((sum, d) => sum + d, 0);
    const avgDuration = this.queryCount > 0 ? totalDuration / this.queryCount : 0;
    const sorted = [...this.queryDurations].sort((a, b) => a - b);
    const p50 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] ?? 0 : 0;
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] ?? 0 : 0;
    const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] ?? 0 : 0;

    return {
      totalQueries: this.queryCount,
      totalReads: this.readCount,
      totalWrites: this.writeCount,
      totalTransactions: this.transactionCount,
      totalErrors: this.errorCount,
      slowQueryCount: this.slowQueryCount,
      averageQueryDurationMs: Math.round(avgDuration),
      p50DurationMs: p50,
      p95DurationMs: p95,
      p99DurationMs: p99,
      uptimeMs: Date.now() - this.startTime,
      timings: Object.fromEntries(this.timings),
    };
  }

  reset(): void {
    this.queryCount = 0;
    this.readCount = 0;
    this.writeCount = 0;
    this.transactionCount = 0;
    this.errorCount = 0;
    this.slowQueryCount = 0;
    this.queryDurations.length = 0;
    this.timings.clear();
    this.startTime = Date.now();
  }
}
