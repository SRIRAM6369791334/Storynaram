import { describe, it, expect } from 'vitest';
import { StoryRepositoryContract, STORY_REPOSITORY } from '../src/story-repository';

describe('StoryRepositoryContract', () => {
  it('has a valid symbol', () => {
    expect(STORY_REPOSITORY).toBeDefined();
    expect(typeof STORY_REPOSITORY).toBe('symbol');
  });

  it('defines the contract shape', () => {
    const contract: StoryRepositoryContract = {
      findById: async () => null,
      findAll: async () => [],
      save: async () => {},
      delete: async () => {},
      count: async () => 0,
      exists: async () => false,
      findByIdentity: async () => null,
      findByTitle: async () => [],
      findByFormat: async () => [],
      findByPhase: async () => [],
      findByCharacter: async () => [],
      findByTheme: async () => [],
      findByTimeline: async () => [],
      findByCanon: async () => [],
      findByNarrative: async () => [],
      findByGenre: async () => [],
      findByStatus: async () => [],
      search: async () => [],
    };
    expect(contract.findById).toBeDefined();
    expect(contract.findByIdentity).toBeDefined();
    expect(contract.findByTitle).toBeDefined();
    expect(contract.findByCharacter).toBeDefined();
    expect(contract.findByTheme).toBeDefined();
    expect(contract.findByTimeline).toBeDefined();
    expect(contract.findByCanon).toBeDefined();
    expect(contract.findByNarrative).toBeDefined();
    expect(contract.search).toBeDefined();
  });
});
