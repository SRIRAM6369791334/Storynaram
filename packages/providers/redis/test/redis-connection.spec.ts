import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('RedisConnection', () => {
  let connection: RedisConnection;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({
      host: 'localhost',
      port: 6379,
      lazyConnect: true,
    });
  });

  afterEach(async () => {
    await connection.close();
  });

  it('ping returns true', async () => {
    const result = await connection.ping();
    expect(result).toBe(true);
  });

  it('getStatus returns connection state', async () => {
    const status = await connection.getStatus();
    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('cluster');
    expect(status).toHaveProperty('status');
  });

  it('getNativeClient returns a client', () => {
    const client = connection.getNativeClient();
    expect(client).toBeTruthy();
  });

  it('getClient returns a client', () => {
    const client = connection.getClient();
    expect(client).toBeTruthy();
  });

  it('execute runs a command', async () => {
    // set via direct method
    await connection.getNativeClient().set('test:key', 'value');
    const result = await connection.execute('get', ['test:key']);
    expect(result).toBe('value');
  });

  it('dbsize returns number', async () => {
    await connection.getNativeClient().set('a', '1');
    const size = await connection.dbsize();
    expect(size).toBeGreaterThanOrEqual(1);
  });

  it('flushdb clears all data', async () => {
    await connection.getNativeClient().set('x', 'y');
    await connection.flushDb();
    const size = await connection.dbsize();
    expect(size).toBe(0);
  });

  it('info returns server info string', async () => {
    const info = await connection.info();
    expect(typeof info).toBe('string');
  });

  it('getMemoryInfo returns memory stats', async () => {
    const mem = await connection.getMemoryInfo();
    expect(mem).toHaveProperty('used');
    expect(mem).toHaveProperty('peakUsed');
    expect(mem).toHaveProperty('fragmentation');
  });

  it('getUptime returns a number', async () => {
    const uptime = await connection.getUptime();
    expect(typeof uptime).toBe('number');
  });

  it('getConnectedClients returns a number', async () => {
    const clients = await connection.getConnectedClients();
    expect(typeof clients).toBe('number');
  });

  it('getClusterHealth returns null for non-cluster', async () => {
    const health = await connection.getClusterHealth();
    expect(health).toBeNull();
  });

  it('isCluster returns false for standalone', () => {
    expect(connection.isCluster()).toBe(false);
  });
});
