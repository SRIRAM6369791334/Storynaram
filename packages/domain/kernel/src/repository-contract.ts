import { Entity } from './entity';
import { Identity } from './identity';
import { Specification } from './specification';

export interface RepositoryContract<T extends Entity> {
  findById(id: Identity): Promise<T | null>;

  findAll(specification?: Specification<T>): Promise<T[]>;

  save(entity: T): Promise<void>;

  delete(entity: T): Promise<void>;

  count(specification?: Specification<T>): Promise<number>;

  exists(specification: Specification<T>): Promise<boolean>;
}
