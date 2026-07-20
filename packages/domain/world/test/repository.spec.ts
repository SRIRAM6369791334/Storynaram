import { describe, it, expect } from 'vitest';
import { WorldRepositoryContract, WORLD_REPOSITORY } from '../src/world-repository';

describe('WorldRepositoryContract', () => {
  it('has a valid symbol', () => {
    expect(WORLD_REPOSITORY).toBeDefined();
    expect(typeof WORLD_REPOSITORY).toBe('symbol');
  });

  it('defines the contract shape', () => {
    const contract: WorldRepositoryContract = {
      findById: async () => null,
      findAll: async () => [],
      save: async () => {},
      delete: async () => {},
      count: async () => 0,
      exists: async () => false,
      findByIdentity: async () => null,
      findByName: async () => [],
      findByGenre: async () => [],
      findByFactionName: async () => [],
      search: async () => [],
    };
    expect(contract.findById).toBeDefined();
    expect(contract.findByIdentity).toBeDefined();
    expect(contract.findByName).toBeDefined();
    expect(contract.findByGenre).toBeDefined();
    expect(contract.findByFactionName).toBeDefined();
    expect(contract.search).toBeDefined();
  });
});
