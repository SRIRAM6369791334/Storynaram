import { bench, describe } from 'vitest';
import { CharacterFactory } from '../src/character-factory';
import { RelationshipType } from '../src/character-relationships';

const factory = new CharacterFactory();

describe('Relationship updates', () => {
  bench('add 100 relationships', () => {
    const character = factory.create({
      profile: {
        firstName: 'Test',
        lastName: 'Character',
        age: 25,
        gender: 'male',
        species: 'Human',
        role: 'hero',
      },
    });
    for (let i = 0; i < 100; i++) {
      character.addRelationship(`target-${i}`, `Target${i}`, RelationshipType.ALLY);
    }
  });
});
