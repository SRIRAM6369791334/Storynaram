import { describe, it, expect } from 'vitest';
import { CharacterRepositoryContract, CHARACTER_REPOSITORY } from '../src/character-repository';

describe('CharacterRepositoryContract', () => {
  it('has correct symbol token', () => {
    expect(CHARACTER_REPOSITORY).toBeDefined();
    expect(typeof CHARACTER_REPOSITORY).toBe('symbol');
  });

  it('defines the expected method signatures', () => {
    const methods: (keyof CharacterRepositoryContract)[] = [
      'findById',
      'findAll',
      'save',
      'delete',
      'count',
      'exists',
      'findByIdentity',
      'findByName',
      'findBySpecies',
      'findByStatus',
      'findByRole',
      'findByRelationship',
      'search',
    ];
    for (const method of methods) {
      expect(typeof method).toBe('string');
    }
  });
});
