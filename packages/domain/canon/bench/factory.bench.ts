import { bench, describe } from 'vitest';
import { CanonFactory } from '../src/canon-factory';

describe('CanonFactory benchmarks', () => {
  const factory = new CanonFactory();

  bench('create basic canon', () => {
    factory.create({ name: 'Bench Canon', description: 'Benchmark' });
  });

  bench('create with 50 entries', () => {
    factory.create({
      name: 'Bench',
      initialEntries: Array.from({ length: 50 }, (_, i) => ({
        factType: 'character' as const,
        key: `key-${i}`,
        value: `value-${i}`,
      })),
    });
  });

  bench('reconstitute from state', () => {
    factory.reconstitute({ identity: 'bench', name: 'Bench', description: '' });
  });
});
