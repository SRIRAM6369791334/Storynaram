import { describe, it, expect, beforeEach } from 'vitest';
import { SearchRegistry } from '../src/search-registry';
import { InMemorySearchAdapter } from '../src/adapters/in-memory-search.adapter';
import { SearchClient } from '../src/search-client';
import { ProviderNotFoundError } from '../src/errors';

describe('SearchRegistry', () => {
  let registry: SearchRegistry;

  beforeEach(() => {
    registry = new SearchRegistry();
  });

  it('registers and retrieves a client', async () => {
    const adapter = new InMemorySearchAdapter('prov1');
    await adapter.connect();
    const client = new SearchClient(adapter);
    registry.register('prov1', client);
    expect(registry.getClient('prov1').providerName).toBe('prov1');
  });

  it('throws for unknown provider', () => {
    expect(() => registry.getClient('nonexistent')).toThrow(ProviderNotFoundError);
  });

  it('checks provider existence', () => {
    expect(registry.hasProvider('any')).toBe(false);
    const adapter = new InMemorySearchAdapter('any');
    registry.register('any', new SearchClient(adapter));
    expect(registry.hasProvider('any')).toBe(true);
  });

  it('lists all providers', () => {
    registry.register('a', new SearchClient(new InMemorySearchAdapter('a')));
    registry.register('b', new SearchClient(new InMemorySearchAdapter('b')));
    const names = registry.getAllProviders();
    expect(names).toContain('a');
    expect(names).toContain('b');
  });

  it('pings all providers', async () => {
    const a = new InMemorySearchAdapter('a'); await a.connect();
    const b = new InMemorySearchAdapter('b'); await b.connect();
    registry.register('a', new SearchClient(a));
    registry.register('b', new SearchClient(b));
    const results = await registry.pingAll();
    expect(results.a).toBe(true);
    expect(results.b).toBe(true);
  });

  it('closes all providers', async () => {
    const a = new InMemorySearchAdapter('a'); await a.connect();
    registry.register('a', new SearchClient(a));
    await registry.closeAll();
    expect(registry.getAllProviders()).toHaveLength(0);
  });
});
