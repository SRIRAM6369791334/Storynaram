import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';
import { SearchHealthIndicator } from '../src/observability/search-health-indicator';

describe('SearchHealthIndicator', () => {
  let indicator: SearchHealthIndicator;

  beforeEach(async () => {
    const adapter = new InMemorySearchAdapter('test');
    await adapter.connect();
    await adapter.createIndex({ name: 'health-bucket' });
    indicator = new SearchHealthIndicator(adapter);
  });

  it('returns healthy status', async () => {
    const result = await indicator.check();
    expect(result.status).toBe('healthy');
    expect(result.provider).toBe('test');
    expect(result.clusterStatus).toBe('green');
    expect(result.nodeCount).toBeGreaterThanOrEqual(1);
    expect(result.indices.length).toBeGreaterThanOrEqual(1);
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('returns unhealthy when disconnected', async () => {
    const adapter = new InMemorySearchAdapter('down');
    const localIndicator = new SearchHealthIndicator(adapter);
    const result = await localIndicator.check();
    expect(result.status).toBe('unhealthy');
  });
});
