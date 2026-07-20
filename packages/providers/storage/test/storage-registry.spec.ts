import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { StorageRegistry } from '../src/storage-registry';

describe('StorageRegistry', () => {
  let registry: StorageRegistry;

  beforeEach(() => {
    registry = new StorageRegistry();
  });

  it('registers and retrieves a client', async () => {
    const adapter = new MemoryAdapter('mem1');
    await adapter.connect();
    const client = new StorageClient(adapter);
    registry.register('mem1', client);

    const retrieved = registry.getClient('mem1');
    expect(retrieved.providerName).toBe('mem1');
  });

  it('throws for unknown provider', () => {
    expect(() => registry.getClient('nonexistent')).toThrow();
  });

  it('checks provider existence', () => {
    expect(registry.hasProvider('any')).toBe(false);
    const adapter = new MemoryAdapter('any');
    registry.register('any', new StorageClient(adapter));
    expect(registry.hasProvider('any')).toBe(true);
  });

  it('lists all provider names', () => {
    registry.register('a', new StorageClient(new MemoryAdapter('a')));
    registry.register('b', new StorageClient(new MemoryAdapter('b')));
    const names = registry.getAllProviders();
    expect(names).toContain('a');
    expect(names).toContain('b');
  });

  it('pings all providers', async () => {
    const a = new MemoryAdapter('a'); await a.connect();
    const b = new MemoryAdapter('b'); await b.connect();
    registry.register('a', new StorageClient(a));
    registry.register('b', new StorageClient(b));

    const results = await registry.pingAll();
    expect(results.a).toBe(true);
    expect(results.b).toBe(true);
  });

  it('closes all providers', async () => {
    const a = new MemoryAdapter('a'); await a.connect();
    registry.register('a', new StorageClient(a));
    await registry.closeAll();
    expect(registry.getAllProviders()).toHaveLength(0);
  });
});
