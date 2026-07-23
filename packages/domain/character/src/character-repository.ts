import { RepositoryContract } from '@storynaram/domain-kernel';
import { CharacterAggregate } from './character-aggregate.js';
import { CharacterIdentity } from './character-identity.js';
import { CharacterStatus } from './character-status.js';

export interface CharacterRepositoryContract extends RepositoryContract<CharacterAggregate> {
  findByIdentity(identity: CharacterIdentity): Promise<CharacterAggregate | null>;

  findByName(name: string): Promise<CharacterAggregate[]>;

  findBySpecies(species: string): Promise<CharacterAggregate[]>;

  findByStatus(status: CharacterStatus): Promise<CharacterAggregate[]>;

  findByRole(role: string): Promise<CharacterAggregate[]>;

  findByRelationship(targetId: string): Promise<CharacterAggregate[]>;

  search(query: string): Promise<CharacterAggregate[]>;
}

export const CHARACTER_REPOSITORY = Symbol('CHARACTER_REPOSITORY');
