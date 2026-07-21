import { bench, describe } from 'vitest';
import { CanonAggregate } from '../src/canon-aggregate';
import { CanonIdentity } from '../src/canon-identity';

describe('CanonAggregate benchmarks', () => {
  const canon = new CanonAggregate(CanonIdentity.create());
  canon.initialize('Bench Canon', '');

  bench('add entries', () => {
    const c = new CanonAggregate(CanonIdentity.create());
    c.initialize('Bench', '');
    for (let i = 0; i < 50; i++) {
      c.addEntry(`entry-${i}`, 'character', `key-${i}`, `value-${i}`);
    }
  });

  bench('entries of type', () => {
    canon.entriesOfType('character');
  });

  bench('entries by key', () => {
    canon.entriesByKey('name');
  });

  bench('get conflicted entries', () => {
    canon.getConflictedEntries();
  });

  bench('serialize to JSON', () => {
    canon.toJSON();
  });
});
