import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from '../storage-client.js';
import type { HealthCheckResult, StorageCapacityInfo } from '../types.js';

@Injectable()
export class StorageHealthIndicator {
  private readonly logger = new Logger(StorageHealthIndicator.name);

  constructor(private readonly client: StorageClient) {}

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const pingOk = await this.client.ping();
      const latency = Date.now() - start;
      const buckets = await this.client.getAdapter().listBuckets();
      const bucketStatuses = [];
      for (const bucket of buckets.slice(0, 10)) {
        const accessible = await this.client.getAdapter().bucketExists(bucket);
        bucketStatuses.push({ name: bucket, accessible });
      }
      let capacity: StorageCapacityInfo | undefined;
      try {
        capacity = await this.client.getAdapter().getCapacity?.();
      } catch {
        // capacity not available
      }
      if (!pingOk) {
        return {
          status: 'unhealthy',
          provider: this.client.providerName,
          latency,
          buckets: bucketStatuses,
          error: 'Ping failed',
          timestamp: new Date(),
        };
      }
      return {
        status: 'healthy',
        provider: this.client.providerName,
        latency,
        buckets: bucketStatuses,
        storageCapacity: capacity,
        timestamp: new Date(),
      };
    } catch (err) {
      return {
        status: 'unhealthy',
        provider: this.client.providerName,
        latency: Date.now() - start,
        buckets: [],
        error: (err as Error).message,
        timestamp: new Date(),
      };
    }
  }
}
