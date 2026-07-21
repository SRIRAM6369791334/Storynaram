import { bench, describe } from 'vitest';
import { PlatformBootstrap } from '../src/platform-bootstrap';
import type { DomainType } from '../src/integration-registry';

describe('Platform benchmarks', () => {
  bench('initialize bootstrap', () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();
  });

  bench('bootstrap + register all domains', () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();
    const domains = [
      { domain: 'character' as const, name: 'C', version: '1', repository: {}, dependencies: [] as DomainType[], events: ['E'] },
      { domain: 'world' as const, name: 'W', version: '1', repository: {}, dependencies: ['character' as DomainType], events: ['E'] },
      { domain: 'timeline' as const, name: 'T', version: '1', repository: {}, dependencies: ['character' as DomainType, 'world' as DomainType], events: ['E'] },
      { domain: 'canon' as const, name: 'Ca', version: '1', repository: {}, dependencies: ['character' as DomainType, 'world' as DomainType, 'timeline' as DomainType], events: ['E'] },
      { domain: 'narrative' as const, name: 'N', version: '1', repository: {}, dependencies: ['character' as DomainType, 'world' as DomainType, 'timeline' as DomainType, 'canon' as DomainType], events: [] },
      { domain: 'composition' as const, name: 'Co', version: '1', repository: {}, dependencies: ['narrative' as DomainType], events: ['S'] },
    ];
    for (const d of domains) bootstrap.registerDomain(d);
    bootstrap.getComponents().healthService.check();
  });
});
