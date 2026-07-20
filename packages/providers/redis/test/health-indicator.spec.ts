import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { RedisHealthIndicator } from '../src/health/health-indicator';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('RedisHealthIndicator', () => {
  let connection: RedisConnection;
  let health: RedisHealthIndicator;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    health = new RedisHealthIndicator(connection);
  });

  afterEach(async () => {
    await connection.close();
  });

  it('isHealthy returns healthy status when connected', async () => {
    const result = await health.isHealthy();
    expect(result.status).toBe('healthy');
    expect(result.connection).toBe(true);
    expect(result.latency).toBeGreaterThanOrEqual(0);
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.lastChecked).toBeInstanceOf(Date);
  });

  it('checkConnectivity returns true when connected', async () => {
    const connected = await health.checkConnectivity();
    expect(connected).toBe(true);
  });

  it('getLatency returns a positive number', async () => {
    const latency = await health.getLatency();
    expect(latency).toBeGreaterThanOrEqual(0);
  });

  it('isHealthy includes memory info', async () => {
    const result = await health.isHealthy();
    expect(result.memory).toBeDefined();
    expect(result.memory?.used).toBeGreaterThanOrEqual(0);
  });

  it('isHealthy includes connected clients', async () => {
    const result = await health.isHealthy();
    expect(typeof result.connectedClients).toBe('number');
  });
});
