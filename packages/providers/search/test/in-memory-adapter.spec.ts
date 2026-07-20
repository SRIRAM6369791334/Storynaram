import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';

describe('InMemorySearchAdapter', () => {
  let adapter: InMemorySearchAdapter;

  beforeEach(async () => {
    adapter = new InMemorySearchAdapter('test');
    await adapter.connect();
  });

  it('ping returns true when connected', async () => {
    expect(await adapter.ping()).toBe(true);
  });

  it('close disconnects', async () => {
    await adapter.close();
    expect(await adapter.ping()).toBe(false);
  });

  it('creates and lists indices', async () => {
    await adapter.createIndex({ name: 'idx1' });
    await adapter.createIndex({ name: 'idx2' });
    const indices = await adapter.listIndices();
    expect(indices).toContain('idx1');
    expect(indices).toContain('idx2');
  });

  it('checks index existence', async () => {
    await adapter.createIndex({ name: 'existing' });
    expect(await adapter.indexExists('existing')).toBe(true);
    expect(await adapter.indexExists('missing')).toBe(false);
  });

  it('deletes an index', async () => {
    await adapter.createIndex({ name: 'tmp' });
    await adapter.deleteIndex('tmp');
    expect(await adapter.indexExists('tmp')).toBe(false);
  });

  it('throws when deleting nonexistent index', async () => {
    await expect(adapter.deleteIndex('nothing')).rejects.toThrow();
  });

  it('indexes and retrieves a document', async () => {
    await adapter.createIndex({ name: 'docs' });
    await adapter.index({ index: 'docs', id: '1', body: { title: 'hello', count: 42 } });
    const doc = await adapter.get('docs', '1');
    expect(doc).not.toBeNull();
    expect(doc!.body.title).toBe('hello');
    expect(doc!.body.count).toBe(42);
  });

  it('updates a document', async () => {
    await adapter.createIndex({ name: 'docs' });
    await adapter.index({ index: 'docs', id: '1', body: { title: 'hello' } });
    await adapter.update({ index: 'docs', id: '1', body: { title: 'world' } });
    const doc = await adapter.get('docs', '1');
    expect(doc!.body.title).toBe('world');
  });

  it('deletes a document', async () => {
    await adapter.createIndex({ name: 'docs' });
    await adapter.index({ index: 'docs', id: '1', body: { title: 'bye' } });
    await adapter.delete('docs', '1');
    expect(await adapter.exists('docs', '1')).toBe(false);
  });

  it('checks document existence', async () => {
    await adapter.createIndex({ name: 'docs' });
    await adapter.index({ index: 'docs', id: '1', body: { x: 1 } });
    expect(await adapter.exists('docs', '1')).toBe(true);
    expect(await adapter.exists('docs', '2')).toBe(false);
  });

  it('returns null for missing document', async () => {
    await adapter.createIndex({ name: 'docs' });
    expect(await adapter.get('docs', 'nonexistent')).toBeNull();
  });

  it('bulk indexes documents', async () => {
    await adapter.createIndex({ name: 'bulk' });
    const result = await adapter.bulk([
      { action: 'index', index: 'bulk', id: '1', document: { a: 1 } },
      { action: 'index', index: 'bulk', id: '2', document: { a: 2 } },
    ]);
    expect(result.errors).toBe(false);
    expect(result.items).toHaveLength(2);
    expect(await adapter.exists('bulk', '1')).toBe(true);
    expect(await adapter.exists('bulk', '2')).toBe(true);
  });

  it('bulk deletes documents', async () => {
    await adapter.createIndex({ name: 'bulk' });
    await adapter.index({ index: 'bulk', id: '1', body: { x: 1 } });
    await adapter.index({ index: 'bulk', id: '2', body: { x: 2 } });
    const result = await adapter.bulk([
      { action: 'delete', index: 'bulk', id: '1' },
      { action: 'delete', index: 'bulk', id: '2' },
    ]);
    expect(result.errors).toBe(false);
    expect(await adapter.exists('bulk', '1')).toBe(false);
  });

  it('searches with match_all', async () => {
    await adapter.createIndex({ name: 'search' });
    await adapter.index({ index: 'search', id: '1', body: { field: 'value1' } });
    await adapter.index({ index: 'search', id: '2', body: { field: 'value2' } });
    const result = await adapter.search({ index: 'search', query: { match_all: {} } });
    expect(result.total).toBe(2);
    expect(result.hits).toHaveLength(2);
  });

  it('searches with match query', async () => {
    await adapter.createIndex({ name: 'search' });
    await adapter.index({ index: 'search', id: '1', body: { title: 'hello world' } });
    await adapter.index({ index: 'search', id: '2', body: { title: 'goodbye world' } });
    const result = await adapter.search({ index: 'search', query: { match: { title: { query: 'hello' } } } });
    expect(result.total).toBe(1);
    expect(result.hits[0].id).toBe('1');
  });

  it('searches with term query', async () => {
    await adapter.createIndex({ name: 'search' });
    await adapter.index({ index: 'search', id: '1', body: { status: 'active' } });
    await adapter.index({ index: 'search', id: '2', body: { status: 'inactive' } });
    const result = await adapter.search({ index: 'search', query: { term: { status: 'active' } } });
    expect(result.total).toBe(1);
  });

  it('searches with bool query', async () => {
    await adapter.createIndex({ name: 'search' });
    await adapter.index({ index: 'search', id: '1', body: { type: 'user', role: 'admin' } });
    await adapter.index({ index: 'search', id: '2', body: { type: 'user', role: 'viewer' } });
    await adapter.index({ index: 'search', id: '3', body: { type: 'guest', role: 'viewer' } });
    const result = await adapter.search({
      index: 'search',
      query: { bool: { must: [{ term: { type: 'user' } }], filter: [{ term: { role: 'admin' } }] } },
    });
    expect(result.total).toBe(1);
    expect(result.hits[0].id).toBe('1');
  });

  it('supports pagination', async () => {
    await adapter.createIndex({ name: 'pages' });
    for (let i = 1; i <= 10; i++) {
      await adapter.index({ index: 'pages', id: `${i}`, body: { n: i } });
    }
    const page1 = await adapter.search({ index: 'pages', query: { match_all: {} }, from: 0, size: 3 });
    expect(page1.hits).toHaveLength(3);
    const page2 = await adapter.search({ index: 'pages', query: { match_all: {} }, from: 3, size: 3 });
    expect(page2.hits).toHaveLength(3);
  });

  it('supports range query', async () => {
    await adapter.createIndex({ name: 'ranges' });
    await adapter.index({ index: 'ranges', id: '1', body: { price: 10 } });
    await adapter.index({ index: 'ranges', id: '2', body: { price: 50 } });
    await adapter.index({ index: 'ranges', id: '3', body: { price: 100 } });
    const result = await adapter.search({
      index: 'ranges', query: { range: { price: { gte: 20, lte: 80 } } },
    });
    expect(result.total).toBe(1);
    expect(result.hits[0].id).toBe('2');
  });

  it('supports prefix query', async () => {
    await adapter.createIndex({ name: 'prefixes' });
    await adapter.index({ index: 'prefixes', id: '1', body: { name: 'apple' } });
    await adapter.index({ index: 'prefixes', id: '2', body: { name: 'application' } });
    await adapter.index({ index: 'prefixes', id: '3', body: { name: 'banana' } });
    const result = await adapter.search({
      index: 'prefixes', query: { prefix: { name: { value: 'app' } } },
    });
    expect(result.total).toBe(2);
  });

  it('supports wildcard query', async () => {
    await adapter.createIndex({ name: 'wild' });
    await adapter.index({ index: 'wild', id: '1', body: { code: 'abc-123' } });
    await adapter.index({ index: 'wild', id: '2', body: { code: 'xyz-456' } });
    const result = await adapter.search({
      index: 'wild', query: { wildcard: { code: { value: 'abc*' } } },
    });
    expect(result.total).toBe(1);
  });

  it('supports exists query', async () => {
    await adapter.createIndex({ name: 'exists' });
    await adapter.index({ index: 'exists', id: '1', body: { hasField: 'yes' } });
    await adapter.index({ index: 'exists', id: '2', body: { other: 'no' } });
    const result = await adapter.search({
      index: 'exists', query: { exists: { field: 'hasField' } },
    });
    expect(result.total).toBe(1);
  });

  it('supports multi_match query', async () => {
    await adapter.createIndex({ name: 'mm' });
    await adapter.index({ index: 'mm', id: '1', body: { title: 'hello', desc: 'world' } });
    await adapter.index({ index: 'mm', id: '2', body: { title: 'foo', desc: 'bar' } });
    const result = await adapter.search({
      index: 'mm', query: { multi_match: { query: 'hello', fields: ['title', 'desc'] } },
    });
    expect(result.total).toBe(1);
  });

  it('supports sorting', async () => {
    await adapter.createIndex({ name: 'sorted' });
    await adapter.index({ index: 'sorted', id: '1', body: { val: 3 } });
    await adapter.index({ index: 'sorted', id: '2', body: { val: 1 } });
    await adapter.index({ index: 'sorted', id: '3', body: { val: 2 } });
    const result = await adapter.search({
      index: 'sorted', query: { match_all: {} }, sort: [{ field: 'val', order: 'asc' }],
    });
    expect(result.hits.map(h => h.source.val)).toEqual([1, 2, 3]);
  });

  it('returns autocomplete suggestions', async () => {
    await adapter.createIndex({ name: 'ac' });
    await adapter.index({ index: 'ac', id: '1', body: { tag: 'apple' } });
    await adapter.index({ index: 'ac', id: '2', body: { tag: 'application' } });
    await adapter.index({ index: 'ac', id: '3', body: { tag: 'banana' } });
    const suggestions = await adapter.autocomplete({ index: 'ac', field: 'tag', prefix: 'app' });
    expect(suggestions.sort()).toEqual(['apple', 'application']);
  });

  it('returns facets', async () => {
    await adapter.createIndex({ name: 'facet' });
    await adapter.index({ index: 'facet', id: '1', body: { category: 'a' } });
    await adapter.index({ index: 'facet', id: '2', body: { category: 'a' } });
    await adapter.index({ index: 'facet', id: '3', body: { category: 'b' } });
    const result = await adapter.facets('facet', 'category');
    expect(result.buckets).toContainEqual({ value: 'a', count: 2 });
    expect(result.buckets).toContainEqual({ value: 'b', count: 1 });
  });

  it('computes terms aggregation', async () => {
    await adapter.createIndex({ name: 'agg' });
    await adapter.index({ index: 'agg', id: '1', body: { color: 'red' } });
    await adapter.index({ index: 'agg', id: '2', body: { color: 'blue' } });
    await adapter.index({ index: 'agg', id: '3', body: { color: 'red' } });
    const result = await adapter.search({
      index: 'agg', query: { match_all: {} },
      aggregations: { colors: { terms: { field: 'color' } } },
    });
    expect(result.aggregations?.colors.buckets).toHaveLength(2);
    const redBucket = result.aggregations!.colors.buckets!.find(b => b.key === 'red');
    expect(redBucket?.docCount).toBe(2);
  });

  it('computes avg aggregation', async () => {
    await adapter.createIndex({ name: 'avg' });
    await adapter.index({ index: 'avg', id: '1', body: { score: 10 } });
    await adapter.index({ index: 'avg', id: '2', body: { score: 20 } });
    await adapter.index({ index: 'avg', id: '3', body: { score: 30 } });
    const result = await adapter.search({
      index: 'avg', query: { match_all: {} },
      aggregations: { avgScore: { avg: { field: 'score' } } },
    });
    expect(result.aggregations?.avgScore.value).toBe(20);
  });

  it('computes cardinality aggregation', async () => {
    await adapter.createIndex({ name: 'card' });
    await adapter.index({ index: 'card', id: '1', body: { tag: 'a' } });
    await adapter.index({ index: 'card', id: '2', body: { tag: 'a' } });
    await adapter.index({ index: 'card', id: '3', body: { tag: 'b' } });
    const result = await adapter.search({
      index: 'card', query: { match_all: {} },
      aggregations: { tags: { cardinality: { field: 'tag' } } },
    });
    expect(result.aggregations?.tags.value).toBe(2);
  });

  it('manages aliases', async () => {
    await adapter.createIndex({ name: 'source' });
    await adapter.putAlias({ name: 'my-alias', index: 'source' });
    const aliases = await adapter.getAliases();
    expect(aliases).toContainEqual({ name: 'my-alias', index: 'source' });
  });

  it('manages index templates', async () => {
    const tmpl: import('../src/types').IndexTemplate = {
      name: 'my-template',
      indexPatterns: ['logs-*'],
      template: { settings: { numberOfShards: 1 } },
    };
    await adapter.putIndexTemplate(tmpl);
    const got = await adapter.getIndexTemplate('my-template');
    expect(got.name).toBe('my-template');
    expect(await adapter.listIndexTemplates()).toContain('my-template');
  });

  it('reindexes documents', async () => {
    await adapter.createIndex({ name: 'source' });
    await adapter.index({ index: 'source', id: '1', body: { x: 1 } });
    await adapter.index({ index: 'source', id: '2', body: { x: 2 } });
    const result = await adapter.reindex({ source: { index: 'source' }, dest: { index: 'dest' } });
    expect(result.errors).toBe(false);
    expect(await adapter.exists('dest', '1')).toBe(true);
    expect(await adapter.exists('dest', '2')).toBe(true);
  });

  it('counts documents', async () => {
    await adapter.createIndex({ name: 'counts' });
    await adapter.index({ index: 'counts', id: '1', body: { a: 1 } });
    await adapter.index({ index: 'counts', id: '2', body: { a: 2 } });
    expect(await adapter.count('counts')).toBe(2);
  });

  it('returns cluster health', async () => {
    await adapter.createIndex({ name: 'h1' });
    await adapter.createIndex({ name: 'h2' });
    const health = await adapter.clusterHealth();
    expect(health.status).toBe('green');
    expect(health.activeShards).toBe(2);
  });

  it('returns index stats', async () => {
    await adapter.createIndex({ name: 'stats-idx' });
    await adapter.index({ index: 'stats-idx', id: '1', body: { x: 1 } });
    const stats = await adapter.indexStats('stats-idx') as import('../src/types').IndexStatsResponse;
    expect(stats.docCount).toBe(1);
    expect(Array.isArray(stats)).toBe(false);
  });

  it('throws on operations when disconnected', async () => {
    await adapter.close();
    await expect(adapter.indexExists('x')).rejects.toThrow();
  });
});
