import { bench, describe } from 'vitest';
import { CharacterFactory } from '../src/character-factory';

const factory = new CharacterFactory();

describe('Character creation', () => {
  bench('create 1000 characters', () => {
    for (let i = 0; i < 1000; i++) {
      factory.create({
        profile: {
          firstName: `First${i}`,
          lastName: `Last${i}`,
          age: 20 + (i % 80),
          gender: i % 2 === 0 ? 'male' : 'female',
          species: 'Human',
          role: 'hero',
        },
      });
    }
  });
});
