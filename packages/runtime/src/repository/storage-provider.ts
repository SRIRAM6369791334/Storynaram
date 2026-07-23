import type { EntityId } from '@storynaram/core';
import type { Filter, PaginationInput, PaginatedResult, RepositoryTransaction, CursorInput, CursorResult } from './types.js';

export interface StorageProvider<T extends { entityId: EntityId }> {
  create(entity: T): Promise<T>;
  insert(entities: T[]): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: EntityId, changes: Partial<T>): Promise<T>;
  delete(id: EntityId): Promise<boolean>;
  softDelete(id: EntityId): Promise<T>;
  restore(id: EntityId): Promise<T>;
  findById(id: EntityId): Promise<T | undefined>;
  findOne(filter: Filter<T>): Promise<T | undefined>;
  findMany(filter?: Filter<T>): Promise<T[]>;
  findAll(): Promise<T[]>;
  exists(id: EntityId): Promise<boolean>;
  count(filter?: Filter<T>): Promise<number>;
  paginate(pagination: PaginationInput, filter?: Filter<T>, sort?: Record<string, 'asc' | 'desc'>): Promise<PaginatedResult<T>>;
  cursor(input: CursorInput, filter?: Filter<T>, sort?: Record<string, 'asc' | 'desc'>): Promise<CursorResult<T>>;
  stream(filter?: Filter<T>): AsyncIterable<T>;
  beginTransaction(): Promise<RepositoryTransaction>;
  supportsTransactions(): boolean;
}
