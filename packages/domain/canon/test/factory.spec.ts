import { describe, it, expect } from 'vitest';
import { CanonFactory } from '../src/canon-factory';
import { FactoryError } from '@storynaram/domain-kernel';

const factory = new CanonFactory();

describe('CanonFactory', () => {
  it('creates a canon with required props', () => {
    const canon = factory.create({
      name: 'Story Canon',
      description: 'Canonical truth layer',
    });
    expect(canon.identity).toBeDefined();
    expect(canon.name).toBe('Story Canon');
    expect(canon.entries.count).toBe(0);
  });

  it('rejects empty name', () => {
    expect(() => factory.create({ name: '' })).toThrow(FactoryError);
  });

  it('uses provided identity', () => {
    const canon = factory.create({
      identity: 'my-canon',
      name: 'Named Canon',
    });
    expect(canon.identity.value).toBe('my-canon');
  });

  it('creates with initial entries', () => {
    const canon = factory.create({
      name: 'Canon with Entries',
      initialEntries: [
        {
          factType: 'character',
          key: 'charName',
          value: 'Gandalf',
        },
        {
          factType: 'world',
          key: 'worldName',
          value: 'Middle-earth',
        },
      ],
    });
    expect(canon.entries.count).toBe(2);
  });

  it('creates with rules', () => {
    const canon = factory.create({
      name: 'Canon with Rules',
      initialEntries: [],
    });
    expect(canon.name).toBe('Canon with Rules');
  });

  it('rejects duplicate keys in initial entries', () => {
    expect(() => factory.create({
      name: 'Bad Canon',
      initialEntries: [
        { factType: 'character', key: 'name', value: 'Gandalf' },
        { factType: 'character', key: 'name', value: 'Saruman' },
      ],
    })).toThrow();
  });

  it('reconstitutes from state', () => {
    const canon = factory.reconstitute({
      identity: 'recon-canon',
      name: 'Reconstituted',
      description: 'Rebuilt from state',
    });
    expect(canon.identity.value).toBe('recon-canon');
    expect(canon.name).toBe('Reconstituted');
  });
});
