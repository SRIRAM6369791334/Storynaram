import { describe, it, expect, beforeEach } from 'vitest';
import { StorageMetricsCollector } from '../src/observability/metrics-collector';

describe('StorageMetricsCollector', () => {
  let collector: StorageMetricsCollector;

  beforeEach(() => {
    collector = new StorageMetricsCollector();
  });

  it('starts with zero metrics', () => {
    const metrics = collector.getMetrics();
    expect(metrics.uploadCount).toBe(0);
    expect(metrics.downloadCount).toBe(0);
    expect(metrics.errors).toBe(0);
  });

  it('records uploads', () => {
    collector.recordUpload(1024, 100);
    collector.recordUpload(2048, 200);
    const metrics = collector.getMetrics();
    expect(metrics.uploadCount).toBe(2);
    expect(metrics.bytesUploaded).toBe(3072);
  });

  it('records downloads', () => {
    collector.recordDownload(512, 50);
    const metrics = collector.getMetrics();
    expect(metrics.downloadCount).toBe(1);
    expect(metrics.bytesDownloaded).toBe(512);
  });

  it('records errors', () => {
    collector.recordError();
    collector.recordError();
    expect(collector.getMetrics().errors).toBe(2);
  });

  it('records deletes', () => {
    collector.recordDelete();
    expect(collector.getMetrics().deleteCount).toBe(1);
  });

  it('records lists', () => {
    collector.recordList();
    expect(collector.getMetrics().listCount).toBe(1);
  });

  it('records multipart uploads', () => {
    collector.recordMultipartUpload();
    expect(collector.getMetrics().multipartUploadCount).toBe(1);
  });

  it('records signed URLs', () => {
    collector.recordSignedUrl();
    expect(collector.getMetrics().signedUrlCount).toBe(1);
  });

  it('calculates average latency', () => {
    collector.recordLatency('upload', 100);
    collector.recordLatency('upload', 200);
    collector.recordLatency('upload', 300);
    expect(collector.getAverageLatency('upload')).toBe(200);
  });

  it('calculates percentile latency', () => {
    for (let i = 1; i <= 100; i++) {
      collector.recordLatency('download', i);
    }
    expect(collector.getPercentileLatency('download', 95)).toBe(95);
    expect(collector.getPercentileLatency('download', 99)).toBe(99);
  });

  it('resets metrics', () => {
    collector.recordUpload(100, 10);
    collector.reset();
    const metrics = collector.getMetrics();
    expect(metrics.uploadCount).toBe(0);
  });
});
