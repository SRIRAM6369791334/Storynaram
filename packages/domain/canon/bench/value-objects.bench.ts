import { bench, describe } from 'vitest';
import { CanonFact } from '../src/canon-fact';
import { CanonReference } from '../src/canon-reference';
import { CanonConflict } from '../src/canon-conflict';
import { CanonResolution } from '../src/canon-resolution';

describe('Canon value objects benchmarks', () => {
  bench('fact creation', () => {
    new CanonFact('f1', 'character', 'name', 'Gandalf');
  });

  bench('reference creation', () => {
    new CanonReference('character', 'char-1', 'Character', 'name');
  });

  bench('conflict resolution', () => {
    const conflict = new CanonConflict('c1', 'e1', 'e2', 'name', 'Values differ');
    const resolution = new CanonResolution('use_current', 'Gandalf', 'Correct', 'admin');
    conflict.resolve(resolution);
  });
});
