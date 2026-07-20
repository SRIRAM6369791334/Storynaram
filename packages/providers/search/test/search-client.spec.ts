import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SEARCH_PROVIDER } from '../src/tokens';
import { SearchClient } from '../src/search-client';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';

describe('SearchClient', () => {
  let client: SearchClient;
  let adapter: InMemorySearchAdapter;

  beforeEach(async () => {
    adapter = new InMemorySearchAdapter('test');
    await adapter.connect();
    await adapter.createIndex({ name: 'test' });

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SEARCH_PROVIDER, useValue: adapter },
        SearchClient,
      ],
    }).compile();

    client = moduleRef.get(SearchClient);
  });

  it('returns provider name', () => {
    expect(client.providerName).toBe('test');
  });

  it('ping delegates to provider', async () => {
    expect(await client.ping()).toBe(true);
  });

  it('indexExists delegates', async () => {
    expect(await client.indexExists('test')).toBe(true);
    expect(await client.indexExists('none')).toBe(false);
  });

  it('index and get documents', async () => {
    await client.index({ index: 'test', id: '1', body: { title: 'hello' } });
    const doc = await client.get('test', '1');
    expect(doc?.body.title).toBe('hello');
  });

  it('update and delete documents', async () => {
    await client.index({ index: 'test', id: '1', body: { v: 1 } });
    await client.update({ index: 'test', id: '1', body: { v: 2 } });
    const doc = await client.get('test', '1');
    expect(doc?.body.v).toBe(2);
    await client.delete('test', '1');
    expect(await client.exists('test', '1')).toBe(false);
  });

  it('bulk operations', async () => {
    const result = await client.bulk([
      { action: 'index', index: 'test', id: '1', document: { x: 1 } },
      { action: 'index', index: 'test', id: '2', document: { x: 2 } },
    ]);
    expect(result.errors).toBe(false);
    expect(result.items).toHaveLength(2);
  });

  it('search operations', async () => {
    await client.index({ index: 'test', id: '1', body: { tag: 'foo' } });
    await client.index({ index: 'test', id: '2', body: { tag: 'bar' } });
    const result = await client.search({ index: 'test', query: { match_all: {} } });
    expect(result.total).toBe(2);
  });

  it('autocomplete', async () => {
    await client.index({ index: 'test', id: '1', body: { name: 'apple' } });
    await client.index({ index: 'test', id: '2', body: { name: 'application' } });
    const suggestions = await client.autocomplete({ index: 'test', field: 'name', prefix: 'app' });
    expect(suggestions).toHaveLength(2);
  });

  it('facets', async () => {
    await client.index({ index: 'test', id: '1', body: { cat: 'x' } });
    await client.index({ index: 'test', id: '2', body: { cat: 'x' } });
    await client.index({ index: 'test', id: '3', body: { cat: 'y' } });
    const result = await client.facets('test', 'cat');
    expect(result.buckets).toHaveLength(2);
  });

  it('cluster health', async () => {
    const health = await client.clusterHealth();
    expect(health.status).toBe('green');
  });

  it('index stats', async () => {
    const stats = await client.indexStats() as Record<string, import('../src/types').IndexStatsResponse>;
    expect(stats.test).toBeDefined();
  });

  it('count documents', async () => {
    await client.index({ index: 'test', id: '1', body: { v: 1 } });
    expect(await client.count('test')).toBe(1);
  });
});
