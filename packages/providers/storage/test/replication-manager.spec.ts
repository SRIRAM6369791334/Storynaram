import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { ReplicationManager } from '../src/replication-manager';

describe('ReplicationManager', () => {
  let manager: ReplicationManager;

  beforeEach(async () => {
    const adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('source');
    const client = new StorageClient(adapter);
    manager = new ReplicationManager(client);
  });

  it('throws on memory adapter for setConfig', async () => {
    await expect(
      manager.setConfig('source', { role: 'arn:aws:iam::role', rules: [] }),
    ).rejects.toThrow('Replication');
  });

  it('throws on memory adapter for getConfig', async () => {
    await expect(manager.getConfig('source')).rejects.toThrow('Replication');
  });
});
