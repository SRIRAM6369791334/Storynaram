import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter('test-memory');
    await adapter.connect();
  });

  it('creates and lists buckets', async () => {
    await adapter.createBucket('bucket1');
    await adapter.createBucket('bucket2');
    const buckets = await adapter.listBuckets();
    expect(buckets).toContain('bucket1');
    expect(buckets).toContain('bucket2');
  });

  it('checks bucket existence', async () => {
    await adapter.createBucket('my-bucket');
    expect(await adapter.bucketExists('my-bucket')).toBe(true);
    expect(await adapter.bucketExists('nonexistent')).toBe(false);
  });

  it('deletes a bucket', async () => {
    await adapter.createBucket('tmp');
    await adapter.deleteBucket('tmp');
    expect(await adapter.bucketExists('tmp')).toBe(false);
  });

  it('throws when deleting nonexistent bucket', async () => {
    await expect(adapter.deleteBucket('nope')).rejects.toThrow();
  });

  it('uploads and downloads an object', async () => {
    await adapter.createBucket('data');
    const data = Buffer.from('hello world');
    const result = await adapter.upload('data', 'test.txt', data, { contentType: 'text/plain' });
    expect(result.etag).toBeTruthy();
    expect(result.size).toBe(11);

    const downloaded = await adapter.download('data', 'test.txt');
    expect(downloaded.data.toString()).toBe('hello world');
    expect(downloaded.contentType).toBe('text/plain');
  });

  it('checks object existence', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'exists.txt', Buffer.from('yes'));
    expect(await adapter.exists('data', 'exists.txt')).toBe(true);
    expect(await adapter.exists('data', 'no.txt')).toBe(false);
  });

  it('deletes an object', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'delete-me.txt', Buffer.from('bye'));
    await adapter.delete('data', 'delete-me.txt');
    expect(await adapter.exists('data', 'delete-me.txt')).toBe(false);
  });

  it('throws when deleting nonexistent object', async () => {
    await adapter.createBucket('data');
    await expect(adapter.delete('data', 'nothing')).rejects.toThrow();
  });

  it('copies an object', async () => {
    await adapter.createBucket('src');
    await adapter.createBucket('dst');
    await adapter.upload('src', 'file.txt', Buffer.from('copy me'));
    await adapter.copy({ bucket: 'src', key: 'file.txt' }, { bucket: 'dst', key: 'copied.txt' });
    expect(await adapter.exists('dst', 'copied.txt')).toBe(true);
    const downloaded = await adapter.download('dst', 'copied.txt');
    expect(downloaded.data.toString()).toBe('copy me');
  });

  it('moves an object', async () => {
    await adapter.createBucket('src');
    await adapter.createBucket('dst');
    await adapter.upload('src', 'move-me.txt', Buffer.from('moving'));
    await adapter.move({ bucket: 'src', key: 'move-me.txt' }, { bucket: 'dst', key: 'moved.txt' });
    expect(await adapter.exists('src', 'move-me.txt')).toBe(false);
    expect(await adapter.exists('dst', 'moved.txt')).toBe(true);
  });

  it('renames an object', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'old.txt', Buffer.from('rename test'));
    await adapter.rename('data', 'old.txt', 'new.txt');
    expect(await adapter.exists('data', 'old.txt')).toBe(false);
    expect(await adapter.exists('data', 'new.txt')).toBe(true);
  });

  it('lists objects with prefix', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'a/file1.txt', Buffer.from('a1'));
    await adapter.upload('data', 'a/file2.txt', Buffer.from('a2'));
    await adapter.upload('data', 'b/file3.txt', Buffer.from('b1'));

    const result = await adapter.list('data', { prefix: 'a/' });
    expect(result.objects).toHaveLength(2);
  });

  it('stores and retrieves metadata', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'meta.txt', Buffer.from('meta'), { metadata: { key1: 'val1' } });
    const meta = await adapter.getMetadata('data', 'meta.txt');
    expect(meta.metadata.key1).toBe('val1');
    expect(meta.size).toBe(4);
  });

  it('stores and retrieves tags', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'tagged.txt', Buffer.from('tags'), { tags: { env: 'test' } });
    const tags = await adapter.getTags('data', 'tagged.txt');
    expect(tags.env).toBe('test');
  });

  it('sets tags separately', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'tags.txt', Buffer.from('tags'));
    await adapter.setTags('data', 'tags.txt', { stage: 'prod', owner: 'team' });
    const tags = await adapter.getTags('data', 'tags.txt');
    expect(tags.stage).toBe('prod');
    expect(tags.owner).toBe('team');
  });

  it('performs multipart upload', async () => {
    await adapter.createBucket('data');
    const uploadId = await adapter.createMultipartUpload('data', 'large.bin');
    expect(uploadId).toBeTruthy();

    const part1 = await adapter.uploadPart('data', 'large.bin', uploadId, 1, Buffer.from('part1'));
    const part2 = await adapter.uploadPart('data', 'large.bin', uploadId, 2, Buffer.from('part2'));

    await adapter.completeMultipartUpload('data', 'large.bin', uploadId, [part1, part2]);

    const downloaded = await adapter.download('data', 'large.bin');
    expect(downloaded.data.toString()).toBe('part1part2');
  });

  it('aborts multipart upload', async () => {
    await adapter.createBucket('data');
    const uploadId = await adapter.createMultipartUpload('data', 'abort.bin');
    await adapter.uploadPart('data', 'abort.bin', uploadId, 1, Buffer.from('data'));
    await adapter.abortMultipartUpload('data', 'abort.bin', uploadId);
    expect(await adapter.exists('data', 'abort.bin')).toBe(false);
  });

  it('versioning', async () => {
    await adapter.createBucket('ver', { versioning: true });
    await adapter.upload('ver', 'doc.txt', Buffer.from('v1'));
    await adapter.upload('ver', 'doc.txt', Buffer.from('v2'));

    const versions = await adapter.listVersions('ver', 'doc.txt');
    expect(versions.length).toBeGreaterThanOrEqual(2);
  });

  it('ping returns true when connected', async () => {
    expect(await adapter.ping()).toBe(true);
  });

  it('close disconnects', async () => {
    await adapter.close();
    expect(await adapter.ping()).toBe(false);
  });
});
