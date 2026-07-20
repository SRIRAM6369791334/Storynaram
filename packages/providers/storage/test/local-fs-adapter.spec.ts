import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFSAdapter } from '../src/adapters/local-fs.adapter';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fsp from 'node:fs/promises';

describe('LocalFSAdapter', () => {
  let adapter: LocalFSAdapter;
  const testDir = path.join(os.tmpdir(), 'storynaram-test-' + Date.now());

  beforeEach(async () => {
    adapter = new LocalFSAdapter('test-local', { basePath: testDir });
    await adapter.connect();
  });

  afterEach(async () => {
    await adapter.close();
    await fsp.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  it('creates and lists buckets', async () => {
    await adapter.createBucket('bucket1');
    await adapter.createBucket('bucket2');
    const buckets = await adapter.listBuckets();
    expect(buckets).toContain('bucket1');
    expect(buckets).toContain('bucket2');
  });

  it('checks bucket existence', async () => {
    await adapter.createBucket('exists');
    expect(await adapter.bucketExists('exists')).toBe(true);
    expect(await adapter.bucketExists('no')).toBe(false);
  });

  it('deletes a bucket', async () => {
    await adapter.createBucket('tmp');
    await adapter.deleteBucket('tmp');
    expect(await adapter.bucketExists('tmp')).toBe(false);
  });

  it('uploads and downloads a file', async () => {
    await adapter.createBucket('files');
    const data = Buffer.from('hello local fs');
    const result = await adapter.upload('files', 'test.txt', data, { contentType: 'text/plain' });
    expect(result.etag).toBeTruthy();
    expect(result.size).toBe(14);

    const downloaded = await adapter.download('files', 'test.txt');
    expect(downloaded.data.toString()).toBe('hello local fs');
    expect(downloaded.contentType).toBe('text/plain');
  });

  it('checks file existence', async () => {
    await adapter.createBucket('files');
    await adapter.upload('files', 'exists.txt', Buffer.from('yes'));
    expect(await adapter.exists('files', 'exists.txt')).toBe(true);
    expect(await adapter.exists('files', 'no.txt')).toBe(false);
  });

  it('deletes a file', async () => {
    await adapter.createBucket('files');
    await adapter.upload('files', 'delete.txt', Buffer.from('bye'));
    await adapter.delete('files', 'delete.txt');
    expect(await adapter.exists('files', 'delete.txt')).toBe(false);
  });

  it('copies a file', async () => {
    await adapter.createBucket('src');
    await adapter.createBucket('dst');
    await adapter.upload('src', 'file.txt', Buffer.from('copy test'));
    await adapter.copy({ bucket: 'src', key: 'file.txt' }, { bucket: 'dst', key: 'copy.txt' });
    expect(await adapter.exists('dst', 'copy.txt')).toBe(true);
  });

  it('moves a file', async () => {
    await adapter.createBucket('src');
    await adapter.createBucket('dst');
    await adapter.upload('src', 'move.txt', Buffer.from('moving'));
    await adapter.move({ bucket: 'src', key: 'move.txt' }, { bucket: 'dst', key: 'moved.txt' });
    expect(await adapter.exists('src', 'move.txt')).toBe(false);
    expect(await adapter.exists('dst', 'moved.txt')).toBe(true);
  });

  it('lists files', async () => {
    await adapter.createBucket('data');
    await adapter.upload('data', 'a/f1.txt', Buffer.from('1'));
    await adapter.upload('data', 'a/f2.txt', Buffer.from('2'));
    await adapter.upload('data', 'b/f3.txt', Buffer.from('3'));

    const all = await adapter.list('data');
    expect(all.objects.length).toBe(3);

    const filtered = await adapter.list('data', { prefix: 'a/' });
    expect(filtered.objects.length).toBe(2);
  });

  it('ping returns true', async () => {
    expect(await adapter.ping()).toBe(true);
  });

  it('gets metadata', async () => {
    await adapter.createBucket('meta');
    await adapter.upload('meta', 'file.bin', Buffer.from('metadata test'));
    const meta = await adapter.getMetadata('meta', 'file.bin');
    expect(meta.size).toBe(13);
    expect(meta.etag).toBeTruthy();
  });

  it('performs multipart upload and complete', async () => {
    await adapter.createBucket('multi');
    const uploadId = await adapter.createMultipartUpload('multi', 'large.bin');
    const p1 = await adapter.uploadPart('multi', 'large.bin', uploadId, 1, Buffer.from('part1'));
    const p2 = await adapter.uploadPart('multi', 'large.bin', uploadId, 2, Buffer.from('part2'));
    await adapter.completeMultipartUpload('multi', 'large.bin', uploadId, [p1, p2]);
    const downloaded = await adapter.download('multi', 'large.bin');
    expect(downloaded.data.toString()).toBe('part1part2');
  });

  it('aborts multipart upload', async () => {
    await adapter.createBucket('multi');
    const uploadId = await adapter.createMultipartUpload('multi', 'abort.bin');
    await adapter.abortMultipartUpload('multi', 'abort.bin', uploadId);
    expect(await adapter.exists('multi', 'abort.bin')).toBe(false);
  });
});
