import { bench, describe } from 'vitest';
import { WorldFactory } from '../src/world-factory';

const factory = new WorldFactory();

describe('World creation', () => {
  bench('create 1000 worlds', () => {
    for (let i = 0; i < 1000; i++) {
      factory.create({
        profile: {
          name: `World ${i}`,
          description: `Description ${i}`,
          genre: i % 2 === 0 ? 'fantasy' : 'sci-fi',
          tone: 'neutral',
        },
      });
    }
  });
});
