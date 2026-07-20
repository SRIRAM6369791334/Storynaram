import { Injectable } from '@nestjs/common';
import type { QueryStatistics } from './types';

@Injectable()
export class QueryStatisticsService {
  private totalQueries = 0;
  private totalExecutionTimeMs = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private errors = 0;
  private readonly queryTimes: number[] = [];

  recordExecution(
    statistics: QueryStatistics,
    error?: boolean,
  ): void {
    this.totalQueries++;
    this.totalExecutionTimeMs += statistics.executionTimeMs;
    this.queryTimes.push(statistics.executionTimeMs);
    if (this.queryTimes.length > 1000) {
      this.queryTimes.shift();
    }
    if (statistics.cacheHit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    if (error) {
      this.errors++;
    }
  }

  getAggregateStatistics(): {
    totalQueries: number;
    averageExecutionTimeMs: number;
    p50ExecutionTimeMs: number;
    p95ExecutionTimeMs: number;
    p99ExecutionTimeMs: number;
    cacheHitRate: number;
    errorRate: number;
    totalExecutionTimeMs: number;
  } {
    const sorted = [...this.queryTimes].sort((a, b) => a - b);
    const len = sorted.length;
    const cacheTotal = this.cacheHits + this.cacheMisses;

    return {
      totalQueries: this.totalQueries,
      averageExecutionTimeMs: this.totalQueries > 0 ? this.totalExecutionTimeMs / this.totalQueries : 0,
      p50ExecutionTimeMs: len > 0 ? sorted[Math.floor(len * 0.5)] ?? 0 : 0,
      p95ExecutionTimeMs: len > 0 ? sorted[Math.floor(len * 0.95)] ?? 0 : 0,
      p99ExecutionTimeMs: len > 0 ? sorted[Math.floor(len * 0.99)] ?? 0 : 0,
      cacheHitRate: cacheTotal > 0 ? this.cacheHits / cacheTotal : 0,
      errorRate: this.totalQueries > 0 ? this.errors / this.totalQueries : 0,
      totalExecutionTimeMs: this.totalExecutionTimeMs,
    };
  }

  reset(): void {
    this.totalQueries = 0;
    this.totalExecutionTimeMs = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.errors = 0;
    this.queryTimes.length = 0;
  }
}
