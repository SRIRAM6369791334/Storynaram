import { describe, it, expect } from 'vitest';
import { IntegrationRegistry } from '../src/integration-registry';

describe('IntegrationRegistry', () => {
  it('registers a domain', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character',
      name: 'Character Domain',
      version: '1.0.0',
      repository: {},
      dependencies: ['world'],
      events: ['CharacterCreated'],
    });
    expect(registry.isRegistered('character')).toBe(true);
    expect(registry.getDomainCount()).toBe(1);
  });

  it('throws on duplicate registration', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    expect(() => registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    })).toThrow('already registered');
  });

  it('gets a registration', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'world', name: 'World', version: '2.0.0', repository: {}, dependencies: ['timeline'], events: ['WorldCreated'],
    });
    const r = registry.get('world');
    expect(r.name).toBe('World');
    expect(r.version).toBe('2.0.0');
  });

  it('throws on missing domain', () => {
    expect(() => new IntegrationRegistry().get('canon')).toThrow('not registered');
  });

  it('gets all registrations', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: 'C', version: '', repository: {}, dependencies: [], events: [],
    });
    registry.register({
      domain: 'world', name: 'W', version: '', repository: {}, dependencies: [], events: [],
    });
    expect(registry.getAll()).toHaveLength(2);
  });

  it('gets dependencies', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'narrative', name: '', version: '', repository: {}, dependencies: ['character', 'world', 'timeline'], events: [],
    });
    expect(registry.getDependencies('narrative')).toEqual(['character', 'world', 'timeline']);
  });

  it('checks events on a domain', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'canon', name: '', version: '', repository: {}, dependencies: [],
      events: ['CanonCreated', 'CanonUpdated'],
    });
    expect(registry.hasEvent('canon', 'CanonCreated')).toBe(true);
    expect(registry.hasEvent('canon', 'MissingEvent')).toBe(false);
  });

  it('finds domains for an event', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: ['EntityChanged'],
    });
    registry.register({
      domain: 'world', name: '', version: '', repository: {}, dependencies: [], events: ['EntityChanged'],
    });
    registry.register({
      domain: 'timeline', name: '', version: '', repository: {}, dependencies: [], events: ['OtherEvent'],
    });
    const domains = registry.findDomainsForEvent('EntityChanged');
    expect(domains).toHaveLength(2);
    expect(domains).toContain('character');
    expect(domains).toContain('world');
  });

  it('gets events for a domain', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'composition', name: '', version: '', repository: {}, dependencies: [],
      events: ['StoryCreated', 'PlotAdded'],
    });
    expect(registry.getEvents('composition')).toEqual(['StoryCreated', 'PlotAdded']);
  });

  it('clears all registrations', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    registry.clear();
    expect(registry.getDomainCount()).toBe(0);
  });
});
