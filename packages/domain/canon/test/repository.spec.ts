import { describe, it, expect } from 'vitest';
import { CanonRepositoryContract, CANON_REPOSITORY } from '../src/canon-repository';

describe('CanonRepositoryContract', () => {
  it('has a valid symbol', () => {
    expect(CANON_REPOSITORY).toBeDefined();
    expect(typeof CANON_REPOSITORY).toBe('symbol');
  });

  it('defines the contract shape', () => {
    const contract: CanonRepositoryContract = {
      findById: async () => null,
      findAll: async () => [],
      save: async () => {},
      delete: async () => {},
      count: async () => 0,
      exists: async () => false,
      findByIdentity: async () => null,
      findByName: async () => [],
      findByFactType: async () => [],
      findByKey: async () => [],
      findPublished: async () => [],
      search: async () => [],
    };
    expect(contract.findById).toBeDefined();
    expect(contract.findByIdentity).toBeDefined();
    expect(contract.findByName).toBeDefined();
    expect(contract.findByFactType).toBeDefined();
    expect(contract.findByKey).toBeDefined();
    expect(contract.findPublished).toBeDefined();
    expect(contract.search).toBeDefined();
  });
});
