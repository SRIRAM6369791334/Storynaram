import { describe, it, expect } from 'vitest';
import { CharacterAggregate } from '../src/character-aggregate';
import { CharacterIdentity } from '../src/character-identity';
import { CharacterProfile, CharacterName, CharacterAge, CharacterBirthDate, CharacterGender, CharacterSpecies, CharacterRole } from '../src/character-profile';
import { CharacterStatus } from '../src/character-status';
import { CharacterStatistics } from '../src/character-statistics';
import { CharacterAppearance } from '../src/character-appearance';
import { CharacterPersonality, CharacterTraits } from '../src/character-personality';
import { CharacterAbilities } from '../src/character-abilities';
import { CharacterEmotion, PrimaryEmotion } from '../src/character-emotion';
import { RelationshipType } from '../src/character-relationships';
import { GoalType, GoalStatus } from '../src/character-goals';
import { LifeStage, Consciousness } from '../src/character-status';

function createProfile(): CharacterProfile {
  return new CharacterProfile({
    name: new CharacterName('Frodo', 'Baggins'),
    age: new CharacterAge(33),
    birthDate: CharacterBirthDate.fromISOString('1990-01-01'),
    gender: new CharacterGender('male'),
    species: new CharacterSpecies('Hobbit'),
    role: new CharacterRole('hero'),
  });
}

describe('CharacterAggregate', () => {
  it('creates with identity', () => {
    const char = new CharacterAggregate(CharacterIdentity.create());
    expect(char.identity).toBeDefined();
  });

  it('accepts profile', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.applyProfile(createProfile());
    expect(char.profile.name.fullName).toBe('Frodo Baggins');
  });

  it('accepts status', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.applyStatus(new CharacterStatus({ isAlive: true, isPlayable: true }));
    expect(char.status.isAlive).toBe(true);
  });

  it('accepts statistics', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.applyStatistics(new CharacterStatistics({ level: 5 }));
    expect(char.statistics.level).toBe(5);
  });

  it('learns a skill and raises event', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.learnSkill('Sword Fighting', 3);
    expect(char.skills.count).toBe(1);
    expect(char.skills.get('sword fighting')?.level).toBe(3);
    expect(char.domainEvents.some(e => e.eventType === 'character.skill.learned')).toBe(true);
  });

  it('adds a goal and can complete it', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.addGoal('Defeat the dragon', GoalType.QUEST);
    expect(char.goals.active).toHaveLength(1);
    const goal = char.goals.all[0];
    char.completeGoal(goal.id);
    expect(char.goals.completed).toHaveLength(1);
    expect(char.domainEvents.some(e => e.eventType === 'character.goal.completed')).toBe(true);
  });

  it('manages relationships', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.addRelationship('char-2', 'Samwise', RelationshipType.FRIEND);
    expect(char.relationships.count).toBe(1);
    expect(char.relationships.all[0].targetName).toBe('Samwise');
  });

  it('manages inventory', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.addInventoryItem('The One Ring', 'A powerful artifact', 1);
    expect(char.inventory.count).toBe(1);
    expect(char.inventory.all[0].name).toBe('The One Ring');
  });

  it('manages knowledge', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.addKnowledge('Elvish History', 'Elrond');
    expect(char.knowledge.count).toBe(1);
  });

  it('manages memories', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.addMemory('The Shire', 'Remembering home', 8, true);
    expect(char.memories.count).toBe(1);
    expect(char.memories.significant).toHaveLength(1);
  });

  it('supports snapshots', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.applyProfile(createProfile());
    char.applyStatistics(new CharacterStatistics({ level: 10 }));
    const snapshot = char.createSnapshot();
    expect(snapshot.aggregateId).toBe('1');
    expect(snapshot.version).toBe(char.version.value);
  });

  it('emits deleted event', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.markDeleted();
    expect(char.isDeleted()).toBe(true);
    expect(char.domainEvents.some(e => e.eventType === 'character.deleted')).toBe(true);
  });

  it('version increments on changes', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    const v1 = char.version.value;
    char.applyStatus(new CharacterStatus({ isAlive: false }));
    expect(char.version.value).toBe(v1 + 1);
  });

  it('toJSON serializes all fields', () => {
    const char = new CharacterAggregate(new CharacterIdentity('1'));
    char.applyProfile(createProfile());
    const json = char.toJSON();
    expect(json.profile).toBeDefined();
    expect(json.status).toBeDefined();
    expect(json.statistics).toBeDefined();
    expect(json.skills).toBeDefined();
  });
});
