import { bench, describe } from 'vitest';
import { GoalType } from '../src/character-goals';
import { CharacterFactory } from '../src/character-factory';

const factory = new CharacterFactory();

describe('Serialization', () => {
  const character = factory.create({
    profile: {
      firstName: 'Gandalf',
      lastName: 'the Grey',
      age: 500,
      gender: 'male',
      species: 'Maia',
      role: 'mentor',
      occupation: 'Wizard',
    },
    appearance: { height: 168, hairColor: 'grey', eyeColor: 'blue' },
    personality: {
      traits: ['wise', 'patient', 'powerful'],
      alignment: { moral: 'good', ethical: 'lawful' },
    },
    abilities: { strength: 14, intelligence: 20, wisdom: 20, charisma: 18 },
    backstory: 'A Maiar spirit sent to guide the free peoples.',
  });

  for (let i = 0; i < 10; i++) {
    character.learnSkill(`Skill ${i}`, i + 1);
    character.addGoal(`Goal ${i}`, GoalType.SHORT_TERM);
  }

  bench('toJSON on rich character', () => {
    character.toJSON();
  });

  bench('createSnapshot on rich character', () => {
    character.createSnapshot();
  });
});
