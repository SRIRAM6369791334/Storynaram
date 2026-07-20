import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';
import { SearchMetricsCollector } from '../src/observability/search-metrics';
import { SearchStatisticsService } from '../src/observability/search-statistics';

describe('SearchStatisticsService', () => {
  let service: SearchStatisticsService;
  let metrics: SearchMetricsCollector;
  let adapter: InMemorySearchAdapter;

  beforeEach(async () => {
    adapter = new InMemorySearchAdapter('test');
    await adapter.connect();
    await adapter.createIndex({ name: 'stats-bucket' });
    await adapter.index({ index: 'stats-bucket', id: '1', body: { title: 'doc' } });
    metrics = new SearchMetricsCollector();
    service = new SearchStatisticsService(adapter, metrics);
  });

  it('returns statistics', async () => {
    metrics.recordQuery(50);
    metrics.recordQuery(150);
    metrics.recordIndex();
    metrics.recordAutocomplete();

    const stats = await service.getStatistics();
    expect(stats.totalQueries).toBe(2);
    expect(stats.totalIndexed).toBe(1);
    expect(stats.totalAutocompletes).toBe(1);
    expect(stats.averageQueryTime).toBe(100);
    expect(stats.queryLatencyP50).toBeGreaterThanOrEqual(50);
    expect(stats.queryLatencyP95).toBeGreaterThanOrEqual(50);
    expect(stats.indexCount).toBeGreaterThanOrEqual(1);
    expect(stats.clusterStatus).toBe('green');
    expect(stats.clusterNodes).toBe(1);
  });

  it('handles cluster health failure gracefully', async () => {
    await adapter.close();
    const stats = await service.getStatistics();
    expect(stats.clusterStatus).toBe('unknown');
    expect(stats.clusterNodes).toBe(0);
  });
});
