import { describe, it, expect, beforeEach } from 'vitest';
import { AICostTracker, AIStatisticsService } from '../src/ai';

describe('AICostTracker', () => {
  let tracker: AICostTracker;

  beforeEach(() => {
    tracker = new AICostTracker();
  });

  it('should track token usage', () => {
    const cost = tracker.track('mock', 'mock-model', { inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    expect(cost).toBe(0);
  });

  it('should track cost for paid providers', () => {
    tracker.setPricing('openai', 'gpt-4o', { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' });
    const cost = tracker.track('openai', 'gpt-4o', { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 });
    expect(cost).toBeCloseTo(0.0025 * 1 + 0.01 * 0.5, 5);
  });

  it('should estimate cost', () => {
    const cost = tracker.estimateCost('openai', 'gpt-4o', 1000, 500);
    expect(cost).toBeCloseTo(0.0025 * 1 + 0.01 * 0.5, 5);
  });

  it('should accumulate total cost', () => {
    tracker.track('openai', 'gpt-4o', { inputTokens: 1000, outputTokens: 0, totalTokens: 1000 });
    tracker.track('openai', 'gpt-4o', { inputTokens: 0, outputTokens: 1000, totalTokens: 1000 });
    expect(tracker.getTotalCost()).toBeCloseTo(0.0025 + 0.01, 5);
  });

  it('should provide cost by provider', () => {
    tracker.track('mock', 'm1', { inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    tracker.track('mock', 'm2', { inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    const byProvider = tracker.getCostByProvider();
    expect(byProvider.mock).toBeDefined();
  });

  it('should provide cost by model', () => {
    tracker.track('mock', 'model-a', { inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    const byModel = tracker.getCostByModel();
    expect(byModel['model-a']).toBeDefined();
  });

  it('should get total tokens', () => {
    tracker.track('mock', 'm1', { inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    const total = tracker.getTotalTokens();
    expect(total.inputTokens).toBe(100);
    expect(total.outputTokens).toBe(50);
    expect(total.totalTokens).toBe(150);
  });

  it('should get recent entries', () => {
    tracker.track('mock', 'm1', { inputTokens: 10, outputTokens: 5, totalTokens: 15 });
    tracker.track('mock', 'm2', { inputTokens: 20, outputTokens: 10, totalTokens: 30 });
    const entries = tracker.getRecentEntries(2);
    expect(entries.length).toBe(2);
  });

  it('should clear', () => {
    tracker.track('mock', 'm1', { inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    tracker.clear();
    expect(tracker.entryCount).toBe(0);
  });
});

describe('AIStatisticsService', () => {
  let stats: AIStatisticsService;

  beforeEach(() => {
    stats = new AIStatisticsService(1000);
  });

  it('should record and retrieve statistics', () => {
    stats.record('mock', 100, true, 50);
    stats.record('mock', 200, true, 100);
    const result = stats.getStatistics();
    expect(result.totalRequests).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(0);
  });

  it('should track failures', () => {
    stats.record('mock', 100, true, 50);
    stats.record('mock', 200, false, 0);
    const result = stats.getStatistics();
    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(1);
  });

  it('should calculate percentiles', () => {
    for (let i = 0; i < 100; i++) {
      stats.record('mock', i * 10, true, 10);
    }
    const result = stats.getStatistics();
    expect(result.p50LatencyMs).toBeGreaterThan(0);
    expect(result.p95LatencyMs).toBeGreaterThan(result.p50LatencyMs);
    expect(result.p99LatencyMs).toBeGreaterThan(result.p95LatencyMs);
  });

  it('should provide per-provider stats', () => {
    stats.record('mock', 100, true, 50);
    stats.record('openai', 150, true, 75);
    const result = stats.getStatistics();
    expect(result.providerStats.mock).toBeDefined();
    expect(result.providerStats.openai).toBeDefined();
  });

  it('should handle empty stats', () => {
    const result = stats.getStatistics();
    expect(result.totalRequests).toBe(0);
    expect(result.averageLatencyMs).toBe(0);
  });

  it('should reset', () => {
    stats.record('mock', 100, true, 50);
    stats.reset();
    expect(stats.getStatistics().totalRequests).toBe(0);
  });
});
