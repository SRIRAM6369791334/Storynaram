import { RepositoryContract } from '@storynaram/domain-kernel';
import { CanonAggregate } from './canon-aggregate.js';
import { CanonIdentity } from './canon-identity.js';
import { FactType } from './canon-fact.js';

export interface CanonRepositoryContract extends RepositoryContract<CanonAggregate> {
  findByIdentity(identity: CanonIdentity): Promise<CanonAggregate | null>;

  findByName(name: string): Promise<CanonAggregate[]>;

  findByFactType(factType: FactType): Promise<CanonAggregate[]>;

  findByKey(key: string): Promise<CanonAggregate[]>;

  findPublished(): Promise<CanonAggregate[]>;

  search(query: string): Promise<CanonAggregate[]>;
}

export const CANON_REPOSITORY = Symbol('CANON_REPOSITORY');
