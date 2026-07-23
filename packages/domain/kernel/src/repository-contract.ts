import { Entity } from './entity.js';
import { Identity } from './identity.js';
import { Specification } from './specification.js';

export interface RepositoryContract<T extends Entity> {
  findById(id: Identity): Promise<T | null>;

  findAll(specification?: Specification<T>): Promise<T[]>;

  save(entity: T): Promise<void>;

  delete(entity: T): Promise<void>;

  count(specification?: Specification<T>): Promise<number>;

  exists(specification: Specification<T>): Promise<boolean>;
}
