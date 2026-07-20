import { describe, it, expect } from 'vitest';
import { CharacterFactory } from '../src/character-factory';
import { CharacterAggregate } from '../src/character-aggregate';
import { FactoryError } from '@storynaram/domain-kernel';

describe('CharacterFactory', () => {
  it('creates a character with required props', () => {
    const factory = new CharacterFactory();
    const character = factory.create({
      profile: {
        firstName: 'Aragorn',
        lastName: 'Arathorn',
        age: 87,
        gender: 'male',
        species: 'Human',
        role: 'hero',
      },
    });

    expect(character).toBeInstanceOf(CharacterAggregate);
    expect(character.profile.name.fullName).toBe('Aragorn Arathorn');
    expect(character.profile.age.value).toBe(87);
    expect(character.profile.species.value).toBe('Human');
    expect(character.profile.role.value).toBe('hero');
  });

  it('creates with custom identity', () => {
    const factory = new CharacterFactory();
    const character = factory.create({
      identity: 'custom-id-42',
      profile: {
        firstName: 'Legolas',
        lastName: 'Greenleaf',
        age: 500,
        gender: 'male',
        species: 'Elf',
        role: 'companion',
      },
    });
    expect(character.identity.value).toBe('custom-id-42');
  });

  it('creates with all optional fields', () => {
    const factory = new CharacterFactory();
    const character = factory.create({
      profile: {
        firstName: 'Gandalf',
        lastName: 'Grey',
        middleName: 'Mithrandir',
        nickName: 'The Grey',
        age: 500,
        gender: 'male',
        species: 'Maia',
        role: 'mentor',
        occupation: 'Wizard',
        title: 'Wanderer',
      },
      appearance: {
        height: 168,
        hairColor: 'grey',
        distinguishingFeatures: ['long beard', 'staff'],
      },
      personality: {
        traits: ['wise', 'patient', 'mysterious'],
        alignment: { moral: 'good', ethical: 'lawful' },
      },
      abilities: {
        strength: 12,
        intelligence: 20,
        wisdom: 20,
        charisma: 18,
      },
      backstory: 'A Maiar spirit sent to Middle-earth...',
    });

    expect(character.profile.name.middleName).toBe('Mithrandir');
    expect(character.personality.traits.values).toContain('wise');
    expect(character.abilities.intelligence).toBe(20);
    expect(character.biography.backstory).toContain('Maiar');
  });

  it('throws FactoryError on empty first name', () => {
    const factory = new CharacterFactory();
    expect(() => factory.create({
      profile: {
        firstName: '',
        lastName: 'Doe',
        age: 25,
        gender: 'male',
        species: 'Human',
        role: 'npc',
      },
    })).toThrow(FactoryError);
  });

  it('generates domain event on creation', () => {
    const factory = new CharacterFactory();
    const character = factory.create({
      profile: {
        firstName: 'Frodo',
        lastName: 'Baggins',
        age: 33,
        gender: 'male',
        species: 'Hobbit',
        role: 'hero',
      },
    });
    expect(character.domainEvents.length).toBeGreaterThanOrEqual(1);
    expect(character.domainEvents[0].eventType).toBe('character.created');
  });
});
