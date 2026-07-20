import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { StorageHealthIndicator } from '../src/observability/health-indicator';

describe('StorageHealthIndicator', () => {
  let indicator: StorageHealthIndicator;

  beforeEach(async () => {
    const adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('health-bucket');
    const client = new StorageClient(adapter);
    indicator = new StorageHealthIndicator(client);
  });

  it('returns healthy status', async () => {
    const result = await indicator.check();
    expect(result.status).toBe('healthy');
    expect(result.provider).toBe('test');
    expect(result.latency).toBeGreaterThanOrEqual(0);
    expect(result.buckets.length).toBeGreaterThanOrEqual(1);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('returns unhealthy when disconnected', async () => {
    const adapter = new MemoryAdapter('down');
    const client = new StorageClient(adapter);
    indicator = new StorageHealthIndicator(client);
    const result = await indicator.check();
    expect(result.status).toBe('unhealthy');
  });
});
