import { RepositoryContract } from '@storynaram/domain-kernel';
import { WorldAggregate } from './world-aggregate';
import { WorldIdentity } from './world-identity';

export interface WorldRepositoryContract extends RepositoryContract<WorldAggregate> {
  findByIdentity(identity: WorldIdentity): Promise<WorldAggregate | null>;

  findByName(name: string): Promise<WorldAggregate[]>;

  findByGenre(genre: string): Promise<WorldAggregate[]>;

  findByFactionName(factionName: string): Promise<WorldAggregate[]>;

  search(query: string): Promise<WorldAggregate[]>;
}

export const WORLD_REPOSITORY = Symbol('WORLD_REPOSITORY');
