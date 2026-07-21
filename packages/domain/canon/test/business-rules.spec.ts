import { describe, it, expect } from 'vitest';
import {
  SingleCanonTruthRule,
  ConflictDetectionRule,
  ReferenceValidationRule,
  assertNoUnresolvedConflicts,
} from '../src/business-rules';
import { CanonEntry } from '../src/canon-entry';
import { CanonFact } from '../src/canon-fact';
import { CanonReference } from '../src/canon-reference';
import { CanonConflict } from '../src/canon-conflict';
import { CanonCollection } from '../src/canon-collection';
import { BusinessRuleError } from '@storynaram/domain-kernel';

describe('BusinessRules', () => {
  it('SingleCanonTruthRule passes for new key', () => {
    const rule = new SingleCanonTruthRule('name', 'Gandalf', [], 'entry-1');
    expect(rule.check()).toBeNull();
  });

  it('SingleCanonTruthRule fails for duplicate key with different value', () => {
    const entry = new CanonEntry('existing', 'character', 'name', new CanonFact('f1', 'character', 'name', 'Saruman'));
    const rule = new SingleCanonTruthRule('name', 'Gandalf', [entry], 'entry-1');
    expect(rule.check()).not.toBeNull();
  });

  it('SingleCanonTruthRule allows same key with same value', () => {
    const entry = new CanonEntry('existing', 'character', 'name', new CanonFact('f1', 'character', 'name', 'Gandalf'));
    const rule = new SingleCanonTruthRule('name', 'Gandalf', [entry], 'entry-1');
    expect(rule.check()).toBeNull();
  });

  it('ConflictDetectionRule passes for same value', () => {
    const existing = new CanonFact('f1', 'character', 'name', 'Gandalf');
    const newFact = new CanonFact('f2', 'character', 'name', 'Gandalf');
    const rule = new ConflictDetectionRule('name', 'Gandalf', newFact, existing);
    expect(rule.check()).toBeNull();
  });

  it('ConflictDetectionRule warns for different value', () => {
    const existing = new CanonFact('f1', 'character', 'name', 'Gandalf');
    const newFact = new CanonFact('f2', 'character', 'name', 'Saruman');
    const rule = new ConflictDetectionRule('name', 'Saruman', newFact, existing);
    expect(rule.check()).not.toBeNull();
  });

  it('ReferenceValidationRule passes for valid references', () => {
    const refs = [new CanonReference('character', 'char-1', 'Character')];
    const rule = new ReferenceValidationRule(refs);
    expect(rule.check()).toBeNull();
  });

  it('ReferenceValidationRule fails for empty domain', () => {
    const refs = [new CanonReference('character', 'id', '')];
    const rule = new ReferenceValidationRule(refs);
    expect(rule.check()).toBeNull();
  });

  it('assertNoUnresolvedConflicts passes for clean entries', () => {
    const entry = new CanonEntry('e1', 'character', 'name', new CanonFact('f1', 'character', 'name', 'Gandalf'));
    const collection = new CanonCollection([entry]);
    expect(() => assertNoUnresolvedConflicts(collection)).not.toThrow();
  });

  it('assertNoUnresolvedConflicts throws for conflicted entries', () => {
    const entry = new CanonEntry('e1', 'character', 'name', new CanonFact('f1', 'character', 'name', 'Gandalf'));
    const conflict = new CanonConflict('c1', 'e1', 'e2', 'name', 'Conflict');
    entry.addConflict(conflict);
    const collection = new CanonCollection([entry]);
    expect(() => assertNoUnresolvedConflicts(collection)).toThrow(BusinessRuleError);
  });
});
