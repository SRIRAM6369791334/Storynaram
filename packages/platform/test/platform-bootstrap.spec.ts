import { describe, it, expect } from 'vitest';
import { PlatformBootstrap } from '../src/platform-bootstrap';

describe('PlatformBootstrap', () => {
  it('initializes all components', () => {
    const bootstrap = new PlatformBootstrap();
    const components = bootstrap.initialize();
    expect(components.registry).toBeDefined();
    expect(components.crossDomainService).toBeDefined();
    expect(components.validator).toBeDefined();
    expect(components.referenceResolver).toBeDefined();
    expect(components.eventRouter).toBeDefined();
    expect(components.consistencyValidator).toBeDefined();
    expect(components.referenceGraph).toBeDefined();
    expect(components.dependencyGraph).toBeDefined();
    expect(components.impactAnalysis).toBeDefined();
    expect(components.platformGraph).toBeDefined();
    expect(components.healthService).toBeDefined();
    expect(components.metrics).toBeDefined();
    expect(components.domainMetrics).toBeDefined();
    expect(components.dependencyReportBuilder).toBeDefined();
    expect(components.validationReportBuilder).toBeDefined();
  });

  it('registers a domain', () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();
    bootstrap.registerDomain({
      domain: 'character',
      name: 'Character Domain',
      version: '1.0.0',
      repository: {},
      dependencies: ['world'],
      events: ['CharacterCreated'],
    });
    const registry = bootstrap.getComponents().registry;
    expect(registry.isRegistered('character')).toBe(true);
    const deps = bootstrap.getComponents().dependencyGraph.getDependencies('character');
    expect(deps).toContain('world');
  });

  it('throws on getComponents before init', () => {
    const bootstrap = new PlatformBootstrap();
    expect(() => bootstrap.getComponents()).toThrow('not initialized');
  });

  it('throws on registerDomain before init', () => {
    const bootstrap = new PlatformBootstrap();
    expect(() => bootstrap.registerDomain({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    })).toThrow('not initialized');
  });

  it('returns same components on subsequent calls', () => {
    const bootstrap = new PlatformBootstrap();
    const c1 = bootstrap.initialize();
    const c2 = bootstrap.getComponents();
    expect(c1).toBe(c2);
  });
});
