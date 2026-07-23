import { Injectable } from '@nestjs/common';
import type { StorageMetrics } from '../types.js';

@Injectable()
export class StorageMetricsCollector {
  private metrics: StorageMetrics = this.createEmpty();

  private createEmpty(): StorageMetrics {
    return {
      uploadCount: 0,
      downloadCount: 0,
      deleteCount: 0,
      listCount: 0,
      multipartUploadCount: 0,
      signedUrlCount: 0,
      errors: 0,
      bytesUploaded: 0,
      bytesDownloaded: 0,
      operationLatencies: {},
    };
  }

  recordUpload(bytes: number, latencyMs: number): void {
    this.metrics.uploadCount++;
    this.metrics.bytesUploaded += bytes;
    this.recordLatency('upload', latencyMs);
  }

  recordDownload(bytes: number, latencyMs: number): void {
    this.metrics.downloadCount++;
    this.metrics.bytesDownloaded += bytes;
    this.recordLatency('download', latencyMs);
  }

  recordDelete(): void {
    this.metrics.deleteCount++;
  }

  recordList(): void {
    this.metrics.listCount++;
  }

  recordMultipartUpload(): void {
    this.metrics.multipartUploadCount++;
  }

  recordSignedUrl(): void {
    this.metrics.signedUrlCount++;
  }

  recordError(): void {
    this.metrics.errors++;
  }

  recordLatency(operation: string, ms: number): void {
    if (!this.metrics.operationLatencies[operation]) {
      this.metrics.operationLatencies[operation] = [];
    }
    this.metrics.operationLatencies[operation].push(ms);
    if (this.metrics.operationLatencies[operation].length > 1000) {
      this.metrics.operationLatencies[operation].shift();
    }
  }

  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = this.createEmpty();
  }

  getAverageLatency(operation: string): number {
    const latencies = this.metrics.operationLatencies[operation];
    if (!latencies || latencies.length === 0) return 0;
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  getPercentileLatency(operation: string, percentile: number): number {
    const latencies = this.metrics.operationLatencies[operation];
    if (!latencies || latencies.length === 0) return 0;
    const sorted = [...latencies].sort((a, b) => a - b);
    const idx = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)] ?? 0;
  }
}
