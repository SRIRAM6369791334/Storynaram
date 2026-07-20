import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../src/adapters/memory.adapter';
import { StorageClient } from '../src/storage-client';
import { MetadataService } from '../src/metadata-service';

describe('MetadataService', () => {
  let service: MetadataService;
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter('test');
    await adapter.connect();
    await adapter.createBucket('data');
    const client = new StorageClient(adapter);
    service = new MetadataService(client);
  });

  it('gets metadata for an object', async () => {
    const data = Buffer.from('test content');
    await adapter.upload('data', 'test.txt', data, { contentType: 'text/plain', metadata: { author: 'tester' } });
    const meta = await service.get('data', 'test.txt');
    expect(meta.contentType).toBe('text/plain');
    expect(meta.metadata.author).toBe('tester');
    expect(meta.size).toBe(12);
  });

  it('sets metadata on an object', async () => {
    await adapter.upload('data', 'test.txt', Buffer.from('content'));
    await service.set('data', 'test.txt', { version: '1', status: 'active' });
    const meta = await service.get('data', 'test.txt');
    expect(meta.metadata.version).toBe('1');
    expect(meta.metadata.status).toBe('active');
  });

  it('gets and sets tags', async () => {
    await adapter.upload('data', 'test.txt', Buffer.from('content'));
    await service.setTags('data', 'test.txt', { env: 'prod', tier: '1' });
    const tags = await service.getTags('data', 'test.txt');
    expect(tags.env).toBe('prod');
    expect(tags.tier).toBe('1');
  });
});
