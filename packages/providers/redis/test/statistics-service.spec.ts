import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { RedisHealthIndicator } from '../src/health/health-indicator';
import { MetricsCollector } from '../src/metrics/metrics-collector';
import { StatisticsService } from '../src/statistics/statistics-service';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('StatisticsService', () => {
  let connection: RedisConnection;
  let health: RedisHealthIndicator;
  let metrics: MetricsCollector;
  let stats: StatisticsService;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    health = new RedisHealthIndicator(connection);
    metrics = new MetricsCollector(connection);
    stats = new StatisticsService(connection, health, metrics);
  });

  afterEach(async () => {
    await connection.close();
  });

  it('getStatistics returns initial state', async () => {
    const result = await stats.getStatistics();
    expect(result.totalOperations).toBe(0);
    expect(result.errorCount).toBe(0);
    expect(typeof result.uptimeMs).toBe('number');
    expect(typeof result.cacheHitRate).toBe('number');
    expect(typeof result.averageLatencyMs).toBe('number');
  });

  it('recordOperation increments counter', async () => {
    stats.recordOperation();
    stats.recordOperation();
    stats.recordOperation();
    const result = await stats.getStatistics();
    expect(result.totalOperations).toBe(3);
  });

  it('recordError increments error count', async () => {
    stats.recordError();
    const result = await stats.getStatistics();
    expect(result.errorCount).toBe(1);
  });

  it('reset clears counters', async () => {
    stats.recordOperation();
    stats.recordError();
    await stats.reset();
    const result = await stats.getStatistics();
    expect(result.totalOperations).toBe(0);
    expect(result.errorCount).toBe(0);
  });

  it('getStatistics returns memory and client info', async () => {
    const result = await stats.getStatistics();
    expect(typeof result.memoryUsage).toBe('number');
    expect(typeof result.connectedClients).toBe('number');
  });
});
