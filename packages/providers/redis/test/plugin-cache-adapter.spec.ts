import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { PluginCacheAdapter } from '../src/storage/plugin-cache-adapter';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('PluginCacheAdapter', () => {
  let connection: RedisConnection;
  let adapter: PluginCacheAdapter;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    adapter = new PluginCacheAdapter(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  it('saves and retrieves configuration', async () => {
    await adapter.saveConfiguration('plugin:1', { enabled: true, apiKey: 'sk-123' });
    const config = await adapter.getConfiguration('plugin:1');
    expect(config).toBeDefined();
    expect(config?.enabled).toBe(true);
    expect(config?.apiKey).toBe('sk-123');
  });

  it('getConfiguration returns undefined for missing', async () => {
    const config = await adapter.getConfiguration('no-plugin');
    expect(config).toBeUndefined();
  });

  it('saves and retrieves state', async () => {
    await adapter.saveState('plugin:2', {
      status: 'started',
      stateData: { counter: 42 },
      errorCount: 0,
    });
    const state = await adapter.getState('plugin:2');
    expect(state).toBeDefined();
    expect(state?.status).toBe('started');
  });

  it('getState returns undefined for missing', async () => {
    const state = await adapter.getState('missing-plugin');
    expect(state).toBeUndefined();
  });

  it('records and retrieves metrics', async () => {
    await adapter.recordMetric('plugin:3', 'cpu_usage', 45.2);
    await adapter.recordMetric('plugin:3', 'memory_mb', 128);
    const metrics = await adapter.getMetrics('plugin:3');
    expect(metrics.length).toBeGreaterThanOrEqual(2);
  });

  it('getMetrics filters by metric name', async () => {
    await adapter.recordMetric('plugin:4', 'requests', 100);
    await adapter.recordMetric('plugin:4', 'errors', 2);
    const filtered = await adapter.getMetrics('plugin:4', 'errors');
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.name).toBe('errors');
    expect(filtered[0]?.value).toBe(2);
  });

  it('deletePluginData removes all plugin data', async () => {
    await adapter.saveConfiguration('plugin:del', { x: 1 });
    await adapter.saveState('plugin:del', { status: 'stopped', stateData: {} });
    await adapter.recordMetric('plugin:del', 'm1', 1);
    await adapter.deletePluginData('plugin:del');
    expect(await adapter.getConfiguration('plugin:del')).toBeUndefined();
    expect(await adapter.getState('plugin:del')).toBeUndefined();
  });
});
