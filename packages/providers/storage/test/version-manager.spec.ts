import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { VersionManager } from '../src/version-manager';

describe('VersionManager', () => {
  let manager: VersionManager;
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('versions', { versioning: true });
    const client = new StorageClient(adapter);
    manager = new VersionManager(client);
  });

  it('enables and checks versioning', async () => {
    await manager.setVersioning('versions', true);
    expect(await manager.getVersioningStatus('versions')).toBe(true);
  });

  it('lists object versions', async () => {
    await adapter.upload('versions', 'doc.txt', Buffer.from('v1'));
    await adapter.upload('versions', 'doc.txt', Buffer.from('v2'));

    const versions = await manager.listVersions('versions', 'doc.txt');
    expect(versions.length).toBeGreaterThanOrEqual(2);
    const latest = versions.find(v => v.isLatest);
    expect(latest).toBeDefined();
  });

  it('deletes a version', async () => {
    await adapter.upload('versions', 'doc.txt', Buffer.from('v1'));
    await adapter.upload('versions', 'doc.txt', Buffer.from('v2'));
    const versions = await manager.listVersions('versions', 'doc.txt');
    const currentVersion = versions.find(v => v.isLatest);
    if (currentVersion) {
      await manager.deleteVersion('versions', 'doc.txt', currentVersion.versionId);
      expect(await adapter.exists('versions', 'doc.txt')).toBe(false);
    }
  });
});
