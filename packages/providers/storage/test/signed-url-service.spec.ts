import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { SignedUrlService } from '../src/signed-url-service';

describe('SignedUrlService', () => {
  let service: SignedUrlService;
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('files');
    const client = new StorageClient(adapter);
    service = new SignedUrlService(client);
  });

  it('throws by default for memory adapter', async () => {
    await expect(
      service.generate('upload', 'files', 'test.txt'),
    ).rejects.toThrow();
  });
});
