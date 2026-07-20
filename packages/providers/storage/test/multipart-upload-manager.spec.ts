import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { MultipartUploadManager } from '../src/multipart-upload-manager';

describe('MultipartUploadManager', () => {
  let manager: MultipartUploadManager;
  let client: StorageClient;
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('uploads');
    client = new StorageClient(adapter);
    manager = new MultipartUploadManager(client);
  });

  it('creates a multipart upload', async () => {
    const info = await manager.create('uploads', 'file.bin');
    expect(info.uploadId).toBeTruthy();
    expect(info.bucket).toBe('uploads');
    expect(info.key).toBe('file.bin');
  });

  it('uploads parts and completes', async () => {
    const info = await manager.create('uploads', 'large.bin');
    const part1 = await manager.uploadPart('uploads', 'large.bin', info.uploadId, 1, Buffer.from('part1'));
    const part2 = await manager.uploadPart('uploads', 'large.bin', info.uploadId, 2, Buffer.from('part2'));
    const part3 = await manager.uploadPart('uploads', 'large.bin', info.uploadId, 3, Buffer.from('part3'));

    await manager.complete('uploads', 'large.bin', info.uploadId, [part1, part2, part3]);
    const downloaded = await adapter.download('uploads', 'large.bin');
    expect(downloaded.data.toString()).toBe('part1part2part3');
  });

  it('aborts an upload', async () => {
    const info = await manager.create('uploads', 'abort.bin');
    await manager.uploadPart('uploads', 'abort.bin', info.uploadId, 1, Buffer.from('data'));
    await manager.abort('uploads', 'abort.bin', info.uploadId);
    expect(await adapter.exists('uploads', 'abort.bin')).toBe(false);
  });

  it('uploads a large file in parts', async () => {
    const data = Buffer.from('x'.repeat(15 * 1024 * 1024));
    await manager.uploadLargeFile('uploads', 'large.bin', data, { partSize: 5 * 1024 * 1024 });
    const downloaded = await adapter.download('uploads', 'large.bin');
    expect(downloaded.data.length).toBe(15 * 1024 * 1024);
  });
});
