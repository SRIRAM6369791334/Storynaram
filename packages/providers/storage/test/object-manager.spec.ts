import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { ObjectManager } from '../src/object-manager';

describe('ObjectManager', () => {
  let objectManager: ObjectManager;
  let client: StorageClient;

  beforeEach(async () => {
    const adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('test-bucket');
    client = new StorageClient(adapter);
    objectManager = new ObjectManager(client);
  });

  it('uploads an object', async () => {
    const result = await objectManager.upload('test-bucket', 'hello.txt', Buffer.from('Hello'));
    expect(result.etag).toBeTruthy();
    expect(result.size).toBe(5);
  });

  it('downloads an object', async () => {
    await objectManager.upload('test-bucket', 'data.bin', Buffer.from('binary content'));
    const result = await objectManager.download('test-bucket', 'data.bin');
    expect(result.data.toString()).toBe('binary content');
  });

  it('deletes an object', async () => {
    await objectManager.upload('test-bucket', 'temp.txt', Buffer.from('temp'));
    await objectManager.delete('test-bucket', 'temp.txt');
    expect(await objectManager.exists('test-bucket', 'temp.txt')).toBe(false);
  });

  it('copies an object', async () => {
    await objectManager.upload('test-bucket', 'source.txt', Buffer.from('copy source'));
    await objectManager.copy(
      { bucket: 'test-bucket', key: 'source.txt' },
      { bucket: 'test-bucket', key: 'dest.txt' },
    );
    expect(await objectManager.exists('test-bucket', 'dest.txt')).toBe(true);
  });

  it('moves an object', async () => {
    await objectManager.upload('test-bucket', 'move-src.txt', Buffer.from('moving'));
    await objectManager.move(
      { bucket: 'test-bucket', key: 'move-src.txt' },
      { bucket: 'test-bucket', key: 'move-dst.txt' },
    );
    expect(await objectManager.exists('test-bucket', 'move-src.txt')).toBe(false);
    expect(await objectManager.exists('test-bucket', 'move-dst.txt')).toBe(true);
  });

  it('renames an object', async () => {
    await objectManager.upload('test-bucket', 'old-name.txt', Buffer.from('rename'));
    await objectManager.rename('test-bucket', 'old-name.txt', 'new-name.txt');
    expect(await objectManager.exists('test-bucket', 'old-name.txt')).toBe(false);
    expect(await objectManager.exists('test-bucket', 'new-name.txt')).toBe(true);
  });

  it('lists objects', async () => {
    await objectManager.upload('test-bucket', 'a/1.txt', Buffer.from('1'));
    await objectManager.upload('test-bucket', 'a/2.txt', Buffer.from('2'));
    const list = await objectManager.list('test-bucket', { prefix: 'a/' });
    expect(list.objects.length).toBe(2);
  });

  it('checks object existence', async () => {
    await objectManager.upload('test-bucket', 'present.txt', Buffer.from('here'));
    expect(await objectManager.exists('test-bucket', 'present.txt')).toBe(true);
    expect(await objectManager.exists('test-bucket', 'absent.txt')).toBe(false);
  });

  it('gets and sets metadata', async () => {
    await objectManager.upload('test-bucket', 'meta.txt', Buffer.from('meta'), { metadata: { author: 'test' } });
    const meta = await objectManager.getMetadata('test-bucket', 'meta.txt');
    expect(meta.metadata.author).toBe('test');

    await objectManager.setMetadata('test-bucket', 'meta.txt', { version: '2' });
    const updated = await objectManager.getMetadata('test-bucket', 'meta.txt');
    expect(updated.metadata.version).toBe('2');
  });

  it('gets and sets tags', async () => {
    await objectManager.upload('test-bucket', 'tags.txt', Buffer.from('tags'), { tags: { env: 'test' } });
    const tags = await objectManager.getTags('test-bucket', 'tags.txt');
    expect(tags.env).toBe('test');

    await objectManager.setTags('test-bucket', 'tags.txt', { env: 'prod' });
    const updated = await objectManager.getTags('test-bucket', 'tags.txt');
    expect(updated.env).toBe('prod');
  });
});
