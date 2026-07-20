import { describe, it, expect } from 'vitest';
import { CharacterCreatedEvent, CharacterUpdatedEvent, CharacterDeletedEvent, CharacterRelationshipChangedEvent, CharacterSkillLearnedEvent, CharacterGoalCompletedEvent } from '../src/character-events';

describe('CharacterDomainEvents', () => {
  it('CharacterCreatedEvent has correct type', () => {
    const event = new CharacterCreatedEvent('char-1', { name: 'Test', species: 'Human' });
    expect(event.eventType).toBe('character.created');
    expect(event.aggregateType).toBe('Character');
    expect(event.aggregateId).toBe('char-1');
  });

  it('CharacterUpdatedEvent has correct type', () => {
    const event = new CharacterUpdatedEvent('char-1', { field: 'name' });
    expect(event.eventType).toBe('character.updated');
  });

  it('CharacterDeletedEvent has correct type', () => {
    const event = new CharacterDeletedEvent('char-1');
    expect(event.eventType).toBe('character.deleted');
  });

  it('CharacterRelationshipChangedEvent has correct payload', () => {
    const event = new CharacterRelationshipChangedEvent('char-1', {
      targetId: 'char-2',
      previousType: 'FRIEND',
      newType: 'ENEMY',
    });
    expect(event.eventType).toBe('character.relationship.changed');
    expect(event.payload.targetId).toBe('char-2');
  });

  it('CharacterSkillLearnedEvent has correct payload', () => {
    const event = new CharacterSkillLearnedEvent('char-1', { skillName: 'Sword', skillLevel: 5 });
    expect(event.eventType).toBe('character.skill.learned');
    expect(event.payload.skillName).toBe('Sword');
  });

  it('CharacterGoalCompletedEvent has correct payload', () => {
    const event = new CharacterGoalCompletedEvent('char-1', { goalId: 'goal-1', goalDescription: 'Defeat dragon' });
    expect(event.eventType).toBe('character.goal.completed');
    expect(event.payload.goalDescription).toBe('Defeat dragon');
  });

  it('events support correlation IDs', () => {
    const event = new CharacterCreatedEvent('char-1', { name: 'Test' }, { correlationId: 'corr-1' });
    expect(event.metadata.correlationId).toBe('corr-1');
  });
});
