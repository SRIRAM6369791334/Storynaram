import { describe, it, expect, beforeEach } from 'vitest';
import { BulkIndexer } from '../src/bulk-indexer';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';

describe('BulkIndexer', () => {
  let adapter: InMemorySearchAdapter;
  let indexer: BulkIndexer;

  beforeEach(async () => {
    adapter = new InMemorySearchAdapter('test');
    await adapter.connect();
    await adapter.createIndex({ name: 'bulk' });
    indexer = new BulkIndexer(adapter);
  });

  it('indexes documents in bulk', async () => {
    const ops = [
      { action: 'index' as const, index: 'bulk', id: '1', document: { title: 'a' } },
      { action: 'index' as const, index: 'bulk', id: '2', document: { title: 'b' } },
    ];
    const result = await indexer.index(ops);
    expect(result.errors).toBe(false);
    expect(result.items).toHaveLength(2);
    expect(await adapter.exists('bulk', '1')).toBe(true);
  });

  it('deletes documents in bulk', async () => {
    await adapter.index({ index: 'bulk', id: '1', body: {} });
    await adapter.index({ index: 'bulk', id: '2', body: {} });
    const result = await indexer.delete([
      { action: 'delete', index: 'bulk', id: '1' },
      { action: 'delete', index: 'bulk', id: '2' },
    ]);
    expect(result.errors).toBe(false);
    expect(await adapter.exists('bulk', '1')).toBe(false);
  });

  it('creates documents in bulk', async () => {
    const result = await indexer.create([
      { action: 'create', index: 'bulk', id: '1', document: { x: 1 } },
      { action: 'create', index: 'bulk', id: '2', document: { x: 2 } },
    ]);
    expect(result.errors).toBe(false);
    expect(await adapter.get('bulk', '2')).not.toBeNull();
  });

  it('reindexes from source to dest', async () => {
    await adapter.createIndex({ name: 'source' });
    await adapter.createIndex({ name: 'dest' });
    await adapter.index({ index: 'source', id: '1', body: { val: 'a' } });
    await adapter.index({ index: 'source', id: '2', body: { val: 'b' } });

    const result = await indexer.reindex('source', 'dest');
    expect(result.total).toBe(2);
    expect(await adapter.exists('dest', '1')).toBe(true);
    expect(await adapter.exists('dest', '2')).toBe(true);
  });

  it('handles empty bulk operations', async () => {
    const result = await indexer.index([]);
    expect(result.errors).toBe(false);
    expect(result.items).toHaveLength(0);
  });
});
