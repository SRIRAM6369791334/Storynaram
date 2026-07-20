import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { BucketManager } from '../src/bucket-manager';

describe('BucketManager', () => {
  let bucketManager: BucketManager;
  let client: StorageClient;

  beforeEach(async () => {
    const adapter = new MemoryAdapter('test');
    await adapter.connect();
    client = new StorageClient(adapter);
    bucketManager = new BucketManager(client);
  });

  it('creates a bucket', async () => {
    await bucketManager.create('my-bucket');
    expect(await bucketManager.exists('my-bucket')).toBe(true);
  });

  it('lists buckets', async () => {
    await bucketManager.create('alpha');
    await bucketManager.create('beta');
    const list = await bucketManager.list();
    expect(list).toContain('alpha');
    expect(list).toContain('beta');
  });

  it('deletes a bucket', async () => {
    await bucketManager.create('temp');
    await bucketManager.delete('temp');
    expect(await bucketManager.exists('temp')).toBe(false);
  });

  it('checks bucket existence', async () => {
    expect(await bucketManager.exists('no-such')).toBe(false);
    await bucketManager.create('exists-yes');
    expect(await bucketManager.exists('exists-yes')).toBe(true);
  });

  it('sets and gets versioning', async () => {
    await bucketManager.create('ver-bucket');
    await bucketManager.setVersioning('ver-bucket', true);
    expect(await bucketManager.getVersioningStatus('ver-bucket')).toBe(true);
    await bucketManager.setVersioning('ver-bucket', false);
    expect(await bucketManager.getVersioningStatus('ver-bucket')).toBe(false);
  });
});
