import { describe, it, expect } from 'vitest';
import { UniqueIdentityRule, AgeValidationRule, SpeciesConstraintRule, RelationshipRule, StatusTransitionRule, assertAgeValid, assertUniqueIdentity } from '../src/business-rules';
import { BusinessRuleError } from '@storynaram/domain-kernel';
import { CharacterAggregate } from '../src/character-aggregate';
import { CharacterIdentity } from '../src/character-identity';
import { CharacterProfile, CharacterName, CharacterAge, CharacterBirthDate, CharacterGender, CharacterSpecies, CharacterRole } from '../src/character-profile';
import { CharacterStatus } from '../src/character-status';

function createCharacter(identity: string): CharacterAggregate {
  const char = new CharacterAggregate(new CharacterIdentity(identity));
  char.applyProfile(new CharacterProfile({
    name: new CharacterName('Test', identity),
    age: new CharacterAge(25),
    birthDate: CharacterBirthDate.fromISOString('2000-01-01'),
    gender: new CharacterGender('male'),
    species: new CharacterSpecies('Human'),
    role: new CharacterRole('hero'),
  }));
  char.applyStatus(new CharacterStatus());
  return char;
}

describe('BusinessRules', () => {
  it('UniqueIdentityRule passes for new identity', () => {
    const rule = new UniqueIdentityRule('new-id', new Set(['existing-id']));
    expect(rule.check()).toBeNull();
  });

  it('UniqueIdentityRule fails for duplicate identity', () => {
    const rule = new UniqueIdentityRule('dup-id', new Set(['dup-id']));
    expect(rule.check()).not.toBeNull();
  });

  it('AgeValidationRule passes for valid age', () => {
    const rule = new AgeValidationRule(25);
    expect(rule.check()).toBeNull();
  });

  it('AgeValidationRule fails for negative age', () => {
    const rule = new AgeValidationRule(-1);
    expect(rule.check()).not.toBeNull();
  });

  it('AgeValidationRule fails for excessive age', () => {
    const rule = new AgeValidationRule(1001);
    expect(rule.check()).not.toBeNull();
  });

  it('SpeciesConstraintRule passes for valid species', () => {
    const rule = new SpeciesConstraintRule('human', new Set(['human', 'elf', 'dwarf']));
    expect(rule.check()).toBeNull();
  });

  it('SpeciesConstraintRule fails for invalid species', () => {
    const rule = new SpeciesConstraintRule('orc', new Set(['human', 'elf']));
    expect(rule.check()).not.toBeNull();
  });

  it('RelationshipRule fails at max relationships', () => {
    const char = createCharacter('1');
    const rule = new RelationshipRule(char, 'target-1', 0);
    expect(rule.check()).not.toBeNull();
  });

  it('StatusTransitionRule validates transitions', () => {
    const transitions = new Map([['ALIVE', ['DEAD']]]);
    const rule = new StatusTransitionRule('ALIVE', 'DEAD', transitions);
    expect(rule.check()).toBeNull();
  });

  it('StatusTransitionRule rejects invalid transitions', () => {
    const transitions = new Map([['ALIVE', ['DEAD']]]);
    const rule = new StatusTransitionRule('ALIVE', 'ALIVE', transitions);
    expect(rule.check()).not.toBeNull();
  });

  it('assertAgeValid throws BusinessRuleError', () => {
    expect(() => assertAgeValid(-1)).toThrow(BusinessRuleError);
  });

  it('assertAgeValid does not throw for valid age', () => {
    expect(() => assertAgeValid(25)).not.toThrow();
  });

  it('assertUniqueIdentity throws BusinessRuleError', () => {
    expect(() => assertUniqueIdentity('dup', new Set(['dup']))).toThrow(BusinessRuleError);
  });
});
