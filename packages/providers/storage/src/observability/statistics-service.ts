import { Injectable, Logger } from '@nestjs/common';
import { StorageHealthIndicator } from './health-indicator';
import { StorageMetricsCollector } from './metrics-collector';
import { StorageClient } from '../storage-client';
import type { ProviderStatistics } from '../types';

@Injectable()
export class StorageStatisticsService {
  private readonly logger = new Logger(StorageStatisticsService.name);

  constructor(
    private readonly client: StorageClient,
    private readonly healthIndicator: StorageHealthIndicator,
    private readonly metricsCollector: StorageMetricsCollector,
  ) {}

  async getStatistics(): Promise<ProviderStatistics> {
    const health = await this.healthIndicator.check();
    const metrics = this.metricsCollector.getMetrics();
    const buckets = await this.client.getAdapter().listBuckets();
    let totalObjects = 0;
    for (const bucket of buckets.slice(0, 20)) {
      const list = await this.client.getAdapter().list(bucket, { maxKeys: 1 });
      totalObjects += list.objects.length;
    }
    return {
      totalUploads: metrics.uploadCount,
      totalDownloads: metrics.downloadCount,
      totalDeletes: metrics.deleteCount,
      totalBytesUploaded: metrics.bytesUploaded,
      totalBytesDownloaded: metrics.bytesDownloaded,
      activeMultipartUploads: metrics.multipartUploadCount,
      totalBuckets: buckets.length,
      totalObjects,
      uploadSpeedAvg: metrics.bytesUploaded > 0 && metrics.uploadCount > 0
        ? metrics.bytesUploaded / metrics.uploadCount : 0,
      downloadSpeedAvg: metrics.bytesDownloaded > 0 && metrics.downloadCount > 0
        ? metrics.bytesDownloaded / metrics.downloadCount : 0,
      failureCount: metrics.errors,
      latencyAvg: this.metricsCollector.getAverageLatency('download'),
      latencyP95: this.metricsCollector.getPercentileLatency('download', 95),
      latencyP99: this.metricsCollector.getPercentileLatency('download', 99),
    };
  }
}
