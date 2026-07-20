import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';
import { SearchIndexManager } from '../src/search-index-manager';
import type { IndexTemplate } from '../src/types';

describe('SearchIndexManager', () => {
  let adapter: InMemorySearchAdapter;
  let manager: SearchIndexManager;

  beforeEach(async () => {
    adapter = new InMemorySearchAdapter('test');
    await adapter.connect();
    manager = new SearchIndexManager(adapter);
  });

  it('creates an index', async () => {
    await manager.create({ name: 'my-index' });
    expect(await adapter.indexExists('my-index')).toBe(true);
  });

  it('does not throw on duplicate create', async () => {
    await manager.create({ name: 'dup' });
    await expect(manager.create({ name: 'dup' })).resolves.not.toThrow();
  });

  it('deletes an index', async () => {
    await manager.create({ name: 'tmp' });
    await manager.delete('tmp');
    expect(await adapter.indexExists('tmp')).toBe(false);
  });

  it('lists indices', async () => {
    await adapter.createIndex({ name: 'a' });
    await adapter.createIndex({ name: 'b' });
    const list = await manager.list();
    expect(list).toContain('a');
    expect(list).toContain('b');
  });

  it('checks index existence', async () => {
    await adapter.createIndex({ name: 'yes' });
    expect(await manager.exists('yes')).toBe(true);
    expect(await manager.exists('no')).toBe(false);
  });

  it('manages templates', async () => {
    const tmpl: IndexTemplate = {
      name: 'logs-template',
      indexPatterns: ['logs-*'],
      template: { settings: { numberOfShards: 2 } },
    };
    await manager.putTemplate(tmpl);
    expect(await manager.listTemplates()).toContain('logs-template');
  });

  it('manages aliases', async () => {
    await adapter.createIndex({ name: 'real' });
    await manager.putAlias({ name: 'my-alias', index: 'real' });
    const aliases = await manager.getAliases();
    expect(aliases).toContainEqual({ name: 'my-alias', index: 'real' });
    await manager.deleteAlias('my-alias', 'real');
    expect(await manager.getAliases()).toHaveLength(0);
  });

  it('returns cluster health', async () => {
    const health = await manager.clusterHealth();
    expect(health.status).toBe('green');
  });

  it('returns index stats', async () => {
    await adapter.createIndex({ name: 'stats-i' });
    await adapter.index({ index: 'stats-i', id: '1', body: { x: 1 } });
    const stats = await manager.stats('stats-i') as import('../src/types').IndexStatsResponse;
    expect(stats.docCount).toBe(1);
  });
});
