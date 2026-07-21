import { describe, it, expect } from 'vitest';
import { CanonAggregate } from '../src/canon-aggregate';
import { CanonIdentity } from '../src/canon-identity';
import { CanonConflict } from '../src/canon-conflict';
import {
  CanonicalSpec,
  DeprecatedSpec,
  ConflictedSpec,
  PublishedSpec,
  DraftSpec,
} from '../src/canon-specifications';

describe('Specifications', () => {
  it('CanonicalSpec matches clean canon', () => {
    const spec = new CanonicalSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    expect(spec.isSatisfiedBy(canon)).toBe(true);
  });

  it('CanonicalSpec does not match conflicted canon', () => {
    const spec = new CanonicalSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    const conflict = new CanonConflict('c1', 'e1', 'e2', 'name', 'Test');
    canon.entries.get('e1')!.addConflict(conflict);
    expect(spec.isSatisfiedBy(canon)).toBe(false);
  });

  it('DeprecatedSpec matches canon with deprecated entries', () => {
    const spec = new DeprecatedSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    expect(spec.isSatisfiedBy(canon)).toBe(false);
    canon.deprecateEntry('e1');
    expect(spec.isSatisfiedBy(canon)).toBe(true);
  });

  it('ConflictedSpec matches canon with conflicts', () => {
    const spec = new ConflictedSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    expect(spec.isSatisfiedBy(canon)).toBe(false);
    const conflict = new CanonConflict('c1', 'e1', 'e2', 'name', 'Test');
    canon.entries.get('e1')!.addConflict(conflict);
    expect(spec.isSatisfiedBy(canon)).toBe(true);
  });

  it('PublishedSpec matches published canon', () => {
    const spec = new PublishedSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    expect(spec.isSatisfiedBy(canon)).toBe(false);
    canon.publish();
    expect(spec.isSatisfiedBy(canon)).toBe(true);
  });

  it('DraftSpec matches unpublished clean canon', () => {
    const spec = new DraftSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    expect(spec.isSatisfiedBy(canon)).toBe(true);
  });

  it('DraftSpec does not match published canon', () => {
    const spec = new DraftSpec();
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    canon.publish();
    expect(spec.isSatisfiedBy(canon)).toBe(false);
  });
});
