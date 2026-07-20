import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { MetricsCollector } from '../src/metrics/metrics-collector';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('MetricsCollector', () => {
  let connection: RedisConnection;
  let metrics: MetricsCollector;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    metrics = new MetricsCollector(connection);
  });

  afterEach(async () => {
    metrics.stopCollection();
    await connection.close();
  });

  it('getMetrics returns initial state', async () => {
    const result = await metrics.getMetrics();
    expect(result.commandCount).toBe(0);
    expect(result.cacheHits).toBe(0);
    expect(result.cacheMisses).toBe(0);
    expect(result.hitRate).toBe(0);
    expect(result.slowCommands).toEqual([]);
  });

  it('recordCommand increments command count', async () => {
    metrics.recordCommand(5);
    metrics.recordCommand(10);
    const result = await metrics.getMetrics();
    expect(result.commandCount).toBe(2);
    expect(result.averageLatencyMs).toBe(7.5);
  });

  it('recordCacheHit and recordCacheMiss update stats', async () => {
    metrics.recordCacheHit();
    metrics.recordCacheHit();
    metrics.recordCacheHit();
    metrics.recordCacheMiss();
    const result = await metrics.getMetrics();
    expect(result.cacheHits).toBe(3);
    expect(result.cacheMisses).toBe(1);
    expect(result.hitRate).toBe(0.75);
  });

  it('recordSlowCommand logs slow commands', async () => {
    metrics.recordSlowCommand('KEYS', ['*'], 1500);
    const result = await metrics.getMetrics();
    expect(result.slowCommands.length).toBe(1);
    expect(result.slowCommands[0]?.command).toBe('KEYS');
    expect(result.slowCommands[0]?.durationMs).toBe(1500);
  });

  it('getMetrics includes server metrics', async () => {
    const result = await metrics.getMetrics();
    expect(typeof result.uptimeSeconds).toBe('number');
    expect(typeof result.memoryUsed).toBe('number');
    expect(typeof result.connectedClients).toBe('number');
  });

  it('reset clears all counters', async () => {
    metrics.recordCommand(5);
    metrics.recordCacheHit();
    await metrics.reset();
    const result = await metrics.getMetrics();
    expect(result.commandCount).toBe(0);
    expect(result.cacheHits).toBe(0);
  });
});
