import { describe, it, expect } from 'vitest';
import { NarrativeRepositoryContract, NARRATIVE_REPOSITORY } from '../src/narrative-repository';

describe('NarrativeRepositoryContract', () => {
  it('has a valid symbol', () => {
    expect(NARRATIVE_REPOSITORY).toBeDefined();
    expect(typeof NARRATIVE_REPOSITORY).toBe('symbol');
  });

  it('defines the contract shape', () => {
    const contract: NarrativeRepositoryContract = {
      findById: async () => null,
      findAll: async () => [],
      save: async () => {},
      delete: async () => {},
      count: async () => 0,
      exists: async () => false,
      findByIdentity: async () => null,
      findByTitle: async () => [],
      findByFormat: async () => [],
      findByStatus: async () => [],
      findByGenre: async () => [],
      findByCharacter: async () => [],
      findByTimeline: async () => [],
      findByCanon: async () => [],
      search: async () => [],
    };
    expect(contract.findById).toBeDefined();
    expect(contract.findByIdentity).toBeDefined();
    expect(contract.findByTitle).toBeDefined();
    expect(contract.findByFormat).toBeDefined();
    expect(contract.findByStatus).toBeDefined();
    expect(contract.findByGenre).toBeDefined();
    expect(contract.findByCharacter).toBeDefined();
    expect(contract.findByTimeline).toBeDefined();
    expect(contract.findByCanon).toBeDefined();
    expect(contract.search).toBeDefined();
  });
});
