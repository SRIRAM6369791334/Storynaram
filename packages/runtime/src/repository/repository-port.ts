import type { EntityId } from '@storynaram/core';
import type { Specification } from './specification';
import type {
  Filter,
  PaginationInput,
  PaginatedResult,
  CursorInput,
  CursorResult,
  RepositoryResult,
  RepositoryBatchResult,
  RepositoryTransaction,
  Sort,
  UpsertOptions,
  BulkOperationResult,
} from './types';

export interface RepositoryPort<T extends { entityId: EntityId }> {
  readonly entityType: string;

  create(data: Partial<T>): Promise<RepositoryResult<T>>;
  insert(data: Partial<T>[]): Promise<RepositoryBatchResult<T>>;
  save(data: Partial<T>): Promise<RepositoryResult<T>>;
  update(id: EntityId, data: Partial<T>): Promise<RepositoryResult<T>>;
  delete(id: EntityId): Promise<RepositoryResult<void>>;
  softDelete(id: EntityId): Promise<RepositoryResult<T>>;
  restore(id: EntityId): Promise<RepositoryResult<T>>;

  exists(id: EntityId): Promise<boolean>;
  count(filter?: Filter<T>): Promise<number>;
  findById(id: EntityId): Promise<RepositoryResult<T>>;
  findOne(filter?: Filter<T>): Promise<RepositoryResult<T>>;
  findMany(filter?: Filter<T>): Promise<RepositoryBatchResult<T>>;
  findAll(): Promise<RepositoryBatchResult<T>>;
  paginate(pagination: PaginationInput, filter?: Filter<T>, sort?: Sort<T>[]): Promise<PaginatedResult<T>>;
  cursor(input: CursorInput, filter?: Filter<T>, sort?: Sort<T>[]): Promise<CursorResult<T>>;
  stream(filter?: Filter<T>): AsyncIterable<T>;

  findSatisfying(spec: Specification<T>): Promise<RepositoryBatchResult<T>>;
  countSatisfying(spec: Specification<T>): Promise<number>;

  upsert(options: UpsertOptions<T>): Promise<RepositoryResult<T>>;
  bulkDelete(ids: EntityId[]): Promise<BulkOperationResult>;
  bulkUpdate(ids: EntityId[], data: Partial<T>): Promise<BulkOperationResult>;

  beginTransaction(): Promise<RepositoryTransaction>;
  supportsTransactions(): boolean;
}
