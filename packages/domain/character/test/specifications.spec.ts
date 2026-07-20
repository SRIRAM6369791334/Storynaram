import { describe, it, expect } from 'vitest';
import { CharacterAggregate } from '../src/character-aggregate';
import { CharacterIdentity } from '../src/character-identity';
import { CharacterProfile, CharacterName, CharacterAge, CharacterBirthDate, CharacterGender, CharacterSpecies, CharacterRole } from '../src/character-profile';
import { CharacterStatus, LifeStage, Consciousness } from '../src/character-status';
import {
  AliveSpecification,
  DeadSpecification,
  PlayableSpecification,
  NPCSpecification,
  HeroSpecification,
  VillainSpecification,
} from '../src/character-specifications';
import { RelationshipType } from '../src/character-relationships';

function createCharacter(identity: string, role: string, isAlive: boolean = true, isPlayable: boolean = true): CharacterAggregate {
  const char = new CharacterAggregate(new CharacterIdentity(identity));
  char.applyProfile(new CharacterProfile({
    name: new CharacterName('Test', identity),
    age: new CharacterAge(25),
    birthDate: CharacterBirthDate.fromISOString('2000-01-01'),
    gender: new CharacterGender('male'),
    species: new CharacterSpecies('Human'),
    role: new CharacterRole(role),
  }));
  char.applyStatus(new CharacterStatus({ isAlive, isPlayable, lifeStage: LifeStage.ADULT, consciousness: Consciousness.AWAKE }));
  return char;
}

describe('CharacterSpecifications', () => {
  it('AliveSpecification', () => {
    const alive = createCharacter('1', 'hero', true);
    const dead = createCharacter('2', 'hero', false);
    expect(new AliveSpecification().isSatisfiedBy(alive)).toBe(true);
    expect(new AliveSpecification().isSatisfiedBy(dead)).toBe(false);
  });

  it('DeadSpecification', () => {
    const alive = createCharacter('1', 'hero', true);
    const dead = createCharacter('2', 'hero', false);
    expect(new DeadSpecification().isSatisfiedBy(dead)).toBe(true);
    expect(new DeadSpecification().isSatisfiedBy(alive)).toBe(false);
  });

  it('PlayableSpecification', () => {
    const playable = createCharacter('1', 'hero', true, true);
    const npc = createCharacter('2', 'npc', true, false);
    expect(new PlayableSpecification().isSatisfiedBy(playable)).toBe(true);
    expect(new PlayableSpecification().isSatisfiedBy(npc)).toBe(false);
  });

  it('NPCSpecification', () => {
    const playable = createCharacter('1', 'hero', true, true);
    const npc = createCharacter('2', 'npc', true, false);
    expect(new NPCSpecification().isSatisfiedBy(npc)).toBe(true);
    expect(new NPCSpecification().isSatisfiedBy(playable)).toBe(false);
  });

  it('HeroSpecification', () => {
    const hero = createCharacter('1', 'hero');
    const villain = createCharacter('2', 'villain');
    expect(new HeroSpecification().isSatisfiedBy(hero)).toBe(true);
    expect(new HeroSpecification().isSatisfiedBy(villain)).toBe(false);
  });

  it('VillainSpecification', () => {
    const hero = createCharacter('1', 'hero');
    const villain = createCharacter('2', 'villain');
    expect(new VillainSpecification().isSatisfiedBy(villain)).toBe(true);
    expect(new VillainSpecification().isSatisfiedBy(hero)).toBe(false);
  });

  it('can compose specifications', () => {
    const alive = new AliveSpecification();
    const hero = new HeroSpecification();
    const combined = alive.and(hero);
    const liveHero = createCharacter('1', 'hero', true);
    const deadHero = createCharacter('2', 'hero', false);
    expect(combined.isSatisfiedBy(liveHero)).toBe(true);
    expect(combined.isSatisfiedBy(deadHero)).toBe(false);
  });
});
