import { bench, describe } from 'vitest';
import { IntegrationRegistry } from '../src/integration-registry';

describe('IntegrationRegistry benchmarks', () => {
  bench('register and get', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: 'C', version: '1', repository: {}, dependencies: [], events: ['Evt'],
    });
    registry.get('character');
  });

  bench('find domains for event', () => {
    const registry = new IntegrationRegistry();
    for (const d of ['character', 'world', 'timeline', 'canon', 'narrative', 'composition']) {
      registry.register({
        domain: d as any, name: d, version: '1', repository: {}, dependencies: [], events: ['Event'],
      });
    }
    registry.findDomainsForEvent('Event');
  });
});
