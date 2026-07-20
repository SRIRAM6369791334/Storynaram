import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { StorageHealthIndicator } from '../src/observability/health-indicator';
import { StorageMetricsCollector } from '../src/observability/metrics-collector';
import { StorageStatisticsService } from '../src/observability/statistics-service';

describe('StorageStatisticsService', () => {
  let service: StorageStatisticsService;
  let metricsCollector: StorageMetricsCollector;

  beforeEach(async () => {
    const adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('stats-bucket');
    await adapter.upload('stats-bucket', 'obj.txt', Buffer.from('data'));
    const client = new StorageClient(adapter);
    const healthIndicator = new StorageHealthIndicator(client);
    metricsCollector = new StorageMetricsCollector();
    service = new StorageStatisticsService(client, healthIndicator, metricsCollector);
  });

  it('returns statistics', async () => {
    metricsCollector.recordUpload(100, 50);
    metricsCollector.recordDownload(200, 30);

    const stats = await service.getStatistics();
    expect(stats.totalUploads).toBe(1);
    expect(stats.totalDownloads).toBe(1);
    expect(stats.totalBytesUploaded).toBe(100);
    expect(stats.totalBytesDownloaded).toBe(200);
    expect(stats.totalBuckets).toBeGreaterThanOrEqual(1);
    expect(typeof stats.latencyAvg).toBe('number');
    expect(typeof stats.latencyP95).toBe('number');
  });
});
