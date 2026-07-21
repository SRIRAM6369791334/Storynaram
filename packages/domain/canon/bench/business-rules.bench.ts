import { bench, describe } from 'vitest';
import { SingleCanonTruthRule, ConflictDetectionRule, ReferenceValidationRule } from '../src/business-rules';
import { CanonEntry } from '../src/canon-entry';
import { CanonFact } from '../src/canon-fact';
import { CanonReference } from '../src/canon-reference';

describe('Canon BusinessRules benchmarks', () => {
  const entry = new CanonEntry('e1', 'character', 'name', new CanonFact('f1', 'character', 'name', 'Gandalf'));

  bench('single canon truth check (no conflict)', () => {
    new SingleCanonTruthRule('name', 'Gandalf', [entry], 'e1').check();
  });

  bench('conflict detection (matching values)', () => {
    const existing = new CanonFact('f1', 'character', 'name', 'Gandalf');
    const newFact = new CanonFact('f2', 'character', 'name', 'Gandalf');
    new ConflictDetectionRule('name', 'Gandalf', newFact, existing).check();
  });

  bench('reference validation', () => {
    const refs = Array.from({ length: 10 }, (_, i) =>
      new CanonReference('character', `char-${i}`, 'Character'),
    );
    new ReferenceValidationRule(refs).check();
  });
});
