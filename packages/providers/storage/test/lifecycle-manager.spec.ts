import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { LifecycleManager } from '../src/lifecycle-manager';

describe('LifecycleManager', () => {
  let manager: LifecycleManager;
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('lifecycle-bucket');
    const client = new StorageClient(adapter);
    manager = new LifecycleManager(client);
  });

  it('sets lifecycle rules without error', async () => {
    const rules = [
      {
        id: 'expire-30d',
        enabled: true,
        prefix: 'logs/',
        expiration: { days: 30 },
      },
    ];
    await expect(manager.setRules('lifecycle-bucket', rules)).resolves.toBeUndefined();
  });

  it('gets lifecycle rules', async () => {
    const retrieved = await manager.getRules('lifecycle-bucket');
    expect(Array.isArray(retrieved)).toBe(true);
  });
});
