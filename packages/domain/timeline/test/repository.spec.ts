import { describe, it, expect } from 'vitest';
import { TimelineRepositoryContract, TIMELINE_REPOSITORY } from '../src/timeline-repository';

describe('TimelineRepositoryContract', () => {
  it('has a valid symbol', () => {
    expect(TIMELINE_REPOSITORY).toBeDefined();
    expect(typeof TIMELINE_REPOSITORY).toBe('symbol');
  });

  it('defines the contract shape', () => {
    const contract: TimelineRepositoryContract = {
      findById: async () => null,
      findAll: async () => [],
      save: async () => {},
      delete: async () => {},
      count: async () => 0,
      exists: async () => false,
      findByIdentity: async () => null,
      findByName: async () => [],
      findByEventType: async () => [],
      findArchived: async () => [],
      search: async () => [],
    };
    expect(contract.findById).toBeDefined();
    expect(contract.findByIdentity).toBeDefined();
    expect(contract.findByName).toBeDefined();
    expect(contract.findByEventType).toBeDefined();
    expect(contract.findArchived).toBeDefined();
    expect(contract.search).toBeDefined();
  });
});
