import { describe, it, expect, beforeEach } from 'vitest';
import { SearchMetricsCollector } from '../src/observability/search-metrics';

describe('SearchMetricsCollector', () => {
  let collector: SearchMetricsCollector;

  beforeEach(() => {
    collector = new SearchMetricsCollector();
  });

  it('starts with zero metrics', () => {
    const m = collector.getMetrics();
    expect(m.queryCount).toBe(0);
    expect(m.errors).toBe(0);
  });

  it('records queries with latency', () => {
    collector.recordQuery(50);
    collector.recordQuery(150);
    expect(collector.getMetrics().queryCount).toBe(2);
    expect(collector.getMetrics().totalTook).toBe(200);
    expect(collector.getAverageLatency('search')).toBe(100);
  });

  it('records index operations', () => {
    collector.recordIndex();
    collector.recordIndex();
    expect(collector.getMetrics().indexCount).toBe(2);
  });

  it('records deletes', () => {
    collector.recordDelete();
    expect(collector.getMetrics().deleteCount).toBe(1);
  });

  it('records bulk operations', () => {
    collector.recordBulk(10);
    expect(collector.getMetrics().bulkCount).toBe(10);
  });

  it('records autocompletes', () => {
    collector.recordAutocomplete();
    expect(collector.getMetrics().autocompleteCount).toBe(1);
  });

  it('records errors', () => {
    collector.recordError();
    collector.recordError();
    expect(collector.getMetrics().errors).toBe(2);
  });

  it('records index stats', () => {
    collector.setIndexStats(1000, 50000);
    expect(collector.getMetrics().docCount).toBe(1000);
    expect(collector.getMetrics().indexSizeBytes).toBe(50000);
  });

  it('calculates percentile latency', () => {
    for (let i = 1; i <= 100; i++) {
      collector.recordQuery(i);
    }
    expect(collector.getPercentileLatency('search', 95)).toBe(95);
    expect(collector.getPercentileLatency('search', 99)).toBe(99);
  });

  it('resets metrics', () => {
    collector.recordQuery(10);
    collector.reset();
    expect(collector.getMetrics().queryCount).toBe(0);
  });

  it('returns 0 for empty latency bucket', () => {
    expect(collector.getAverageLatency('empty')).toBe(0);
    expect(collector.getPercentileLatency('empty', 95)).toBe(0);
  });
});
