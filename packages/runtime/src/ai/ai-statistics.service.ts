import { Injectable } from '@nestjs/common';
import type { AIStatistics, AIProviderStatistics, AIProviderName } from './types.js';

interface LatencyEntry {
  provider: AIProviderName;
  latencyMs: number;
  success: boolean;
  tokens: number;
  timestamp: Date;
}

@Injectable()
export class AIStatisticsService {
  private readonly entries: LatencyEntry[] = [];
  private readonly maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  record(provider: AIProviderName, latencyMs: number, success: boolean, tokens: number): void {
    this.entries.push({ provider, latencyMs, success, tokens, timestamp: new Date() });
    if (this.entries.length > this.maxEntries) {
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }
  }

  getStatistics(): AIStatistics {
    const totalEntries = this.entries.length;
    const successEntries = this.entries.filter(e => e.success);
    const failureEntries = this.entries.filter(e => !e.success);

    const latencies = this.entries.map(e => e.latencyMs).sort((a, b) => a - b);
    const totalTokens = this.entries.reduce((sum, e) => sum + e.tokens, 0);
    const totalCost = 0;

    const providerMap = new Map<AIProviderName, LatencyEntry[]>();
    for (const entry of this.entries) {
      const arr = providerMap.get(entry.provider) ?? [];
      arr.push(entry);
      providerMap.set(entry.provider, arr);
    }

    const providerStats: Record<string, AIProviderStatistics> = {};
    for (const [provider, providerEntries] of providerMap) {
      const pSuccess = providerEntries.filter(e => e.success);
      const pLatencies = providerEntries.map(e => e.latencyMs);
      providerStats[provider] = {
        totalRequests: providerEntries.length,
        successCount: pSuccess.length,
        failureCount: providerEntries.length - pSuccess.length,
        totalTokens: providerEntries.reduce((s, e) => s + e.tokens, 0),
        totalCostUsd: 0,
        averageLatencyMs: pLatencies.length > 0 ? pLatencies.reduce((s, l) => s + l, 0) / pLatencies.length : 0,
      };
    }

    return {
      totalRequests: totalEntries,
      totalTokens,
      totalInputTokens: totalTokens,
      totalOutputTokens: totalTokens,
      totalCostUsd: totalCost,
      successCount: successEntries.length,
      failureCount: failureEntries.length,
      cacheHitCount: 0,
      cacheMissCount: 0,
      averageLatencyMs: latencies.length > 0 ? latencies.reduce((s, l) => s + l, 0) / latencies.length : 0,
      p50LatencyMs: this.percentile(latencies, 50),
      p95LatencyMs: this.percentile(latencies, 95),
      p99LatencyMs: this.percentile(latencies, 99),
      providerStats,
    };
  }

  reset(): void {
    this.entries.length = 0;
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }
}
