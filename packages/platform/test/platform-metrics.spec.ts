import { describe, it, expect } from 'vitest';
import { PlatformMetrics } from '../src/observability/platform-metrics';

describe('PlatformMetrics', () => {
  it('increments a counter', () => {
    const metrics = new PlatformMetrics();
    metrics.incrementCounter('test.counter');
    expect(metrics.getCounter('test.counter')).toBe(1);
    metrics.incrementCounter('test.counter');
    expect(metrics.getCounter('test.counter')).toBe(2);
  });

  it('increments counters with different tags separately', () => {
    const metrics = new PlatformMetrics();
    metrics.incrementCounter('ops', { domain: 'character' });
    metrics.incrementCounter('ops', { domain: 'character' });
    metrics.incrementCounter('ops', { domain: 'world' });
    expect(metrics.getCounter('ops', { domain: 'character' })).toBe(2);
    expect(metrics.getCounter('ops', { domain: 'world' })).toBe(1);
  });

  it('sets and gets a gauge', () => {
    const metrics = new PlatformMetrics();
    metrics.setGauge('memory.used', 512);
    expect(metrics.getGauge('memory.used')).toBe(512);
    metrics.setGauge('memory.used', 256);
    expect(metrics.getGauge('memory.used')).toBe(256);
  });

  it('records a metric', () => {
    const metrics = new PlatformMetrics();
    metrics.recordMetric('latency', 42);
    const snapshot = metrics.getSnapshot();
    expect(snapshot.totalMetrics).toBe(1);
    expect(snapshot.metrics[0]!.value).toBe(42);
  });

  it('gets metrics by name', () => {
    const metrics = new PlatformMetrics();
    metrics.recordMetric('latency', 10);
    metrics.recordMetric('latency', 20);
    metrics.recordMetric('throughput', 100);
    const latencyMetrics = metrics.getMetricsByName('latency');
    expect(latencyMetrics).toHaveLength(2);
  });

  it('gets snapshot with all metrics', () => {
    const metrics = new PlatformMetrics();
    metrics.recordMetric('a', 1);
    metrics.recordMetric('b', 2);
    const snapshot = metrics.getSnapshot();
    expect(snapshot.totalMetrics).toBe(2);
  });

  it('clears all metrics', () => {
    const metrics = new PlatformMetrics();
    metrics.recordMetric('a', 1);
    metrics.incrementCounter('c');
    metrics.setGauge('g', 5);
    metrics.clear();
    expect(metrics.getSnapshot().totalMetrics).toBe(0);
    expect(metrics.getCounter('c')).toBe(0);
    expect(metrics.getGauge('g')).toBe(0);
  });

  it('returns 0 for unmetered counter', () => {
    const metrics = new PlatformMetrics();
    expect(metrics.getCounter('nothing')).toBe(0);
  });

  it('returns 0 for unmetered gauge', () => {
    const metrics = new PlatformMetrics();
    expect(metrics.getGauge('nothing')).toBe(0);
  });
});
