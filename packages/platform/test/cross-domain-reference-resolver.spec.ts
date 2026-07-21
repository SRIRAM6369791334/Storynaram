import { describe, it, expect } from 'vitest';
import { CrossDomainReferenceResolver } from '../src/cross-domain/cross-domain-reference-resolver';
import { IntegrationRegistry } from '../src/integration-registry';
import type { DomainType } from '../src/integration-registry';

describe('CrossDomainReferenceResolver', () => {
  it('resolves with registered resolver', async () => {
    const registry = new IntegrationRegistry();
    const resolver = new CrossDomainReferenceResolver(registry);
    resolver.registerResolver('character', 'hero', async (id) => ({
      exists: true, label: `Hero ${id}`,
    }));
    const result = await resolver.resolve({
      domain: 'character', entityId: 'hero-1', entityType: 'hero',
    });
    expect(result.exists).toBe(true);
    expect(result.label).toBe('Hero hero-1');
  });

  it('returns exists false when no resolver', async () => {
    const registry = new IntegrationRegistry();
    const resolver = new CrossDomainReferenceResolver(registry);
    const result = await resolver.resolve({
      domain: 'unknown' as DomainType, entityId: 'x', entityType: 'x',
    });
    expect(result.exists).toBe(false);
    expect(result.label).toContain('No resolver');
  });

  it('returns exists false on resolver error', async () => {
    const registry = new IntegrationRegistry();
    const resolver = new CrossDomainReferenceResolver(registry);
    resolver.registerResolver('world', 'location', async () => {
      throw new Error('DB error');
    });
    const result = await resolver.resolve({
      domain: 'world', entityId: 'loc-1', entityType: 'location',
    });
    expect(result.exists).toBe(false);
    expect(result.label).toContain('Error resolving');
  });

  it('resolves many references', async () => {
    const registry = new IntegrationRegistry();
    const resolver = new CrossDomainReferenceResolver(registry);
    resolver.registerResolver('character', 'hero', async (id) => ({
      exists: true, label: `Hero ${id}`,
    }));
    const results = await resolver.resolveMany([
      { domain: 'character' as DomainType, entityId: 'h1', entityType: 'hero' },
      { domain: 'character' as DomainType, entityId: 'h2', entityType: 'hero' },
      { domain: 'unknown' as DomainType, entityId: 'x', entityType: 'x' },
    ]);
    expect(results).toHaveLength(3);
    expect(results[0]!.exists).toBe(true);
    expect(results[2]!.exists).toBe(false);
  });

  it('checks resolver existence', () => {
    const registry = new IntegrationRegistry();
    const resolver = new CrossDomainReferenceResolver(registry);
    resolver.registerResolver('timeline', 'event', async () => ({ exists: true, label: '' }));
    expect(resolver.hasResolver('timeline', 'event')).toBe(true);
    expect(resolver.hasResolver('timeline', 'nonexistent')).toBe(false);
  });

  it('gets registered resolvers', () => {
    const registry = new IntegrationRegistry();
    const resolver = new CrossDomainReferenceResolver(registry);
    resolver.registerResolver('a' as DomainType, 'x', async () => ({ exists: true, label: '' }));
    resolver.registerResolver('b' as DomainType, 'y', async () => ({ exists: true, label: '' }));
    expect(resolver.getRegisteredResolvers()).toEqual(['a:x', 'b:y']);
  });
});
