import { Injectable } from '@nestjs/common';

export interface SearchMetricsData {
  queryCount: number;
  indexCount: number;
  deleteCount: number;
  bulkCount: number;
  autocompleteCount: number;
  errors: number;
  totalTook: number;
  indexSizeBytes: number;
  docCount: number;
  latencyBuckets: Map<string, number[]>;
}

@Injectable()
export class SearchMetricsCollector {
  private metrics: SearchMetricsData = {
    queryCount: 0,
    indexCount: 0,
    deleteCount: 0,
    bulkCount: 0,
    autocompleteCount: 0,
    errors: 0,
    totalTook: 0,
    indexSizeBytes: 0,
    docCount: 0,
    latencyBuckets: new Map(),
  };

  recordQuery(took: number): void {
    this.metrics.queryCount++;
    this.metrics.totalTook += took;
    this.recordLatency('search', took);
  }

  recordIndex(): void {
    this.metrics.indexCount++;
  }

  recordDelete(): void {
    this.metrics.deleteCount++;
  }

  recordBulk(count: number): void {
    this.metrics.bulkCount += count;
  }

  recordAutocomplete(): void {
    this.metrics.autocompleteCount++;
  }

  recordError(): void {
    this.metrics.errors++;
  }

  recordLatency(operation: string, ms: number): void {
    if (!this.metrics.latencyBuckets.has(operation)) {
      this.metrics.latencyBuckets.set(operation, []);
    }
    this.metrics.latencyBuckets.get(operation)!.push(ms);
  }

  setIndexStats(docCount: number, sizeBytes: number): void {
    this.metrics.docCount = docCount;
    this.metrics.indexSizeBytes = sizeBytes;
  }

  getMetrics(): Readonly<SearchMetricsData> {
    return this.metrics;
  }

  getAverageLatency(operation: string): number {
    const bucket = this.metrics.latencyBuckets.get(operation);
    if (!bucket || bucket.length === 0) return 0;
    return bucket.reduce((a, b) => a + b, 0) / bucket.length;
  }

  getPercentileLatency(operation: string, percentile: number): number {
    const bucket = this.metrics.latencyBuckets.get(operation);
    if (!bucket || bucket.length === 0) return 0;
    const sorted = [...bucket].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  reset(): void {
    this.metrics = {
      queryCount: 0,
      indexCount: 0,
      deleteCount: 0,
      bulkCount: 0,
      autocompleteCount: 0,
      errors: 0,
      totalTook: 0,
      indexSizeBytes: 0,
      docCount: 0,
      latencyBuckets: new Map(),
    };
  }
}
