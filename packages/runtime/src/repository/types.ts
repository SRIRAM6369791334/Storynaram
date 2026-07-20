import type { EntityId } from '@storynaram/core';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'between';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface Filter<T = any> {
  conditions?: FilterCondition[];
  or?: Filter<T>[];
  and?: Filter<T>[];
}

export interface Projection<T = any> {
  select: (keyof T)[];
}

export type SortDirection = 'asc' | 'desc';

export interface Sort<T = any> {
  field: keyof T;
  direction: SortDirection;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface CursorInput {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CursorResult<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface RepositoryBatchResult<T> {
  success: boolean;
  data?: T[];
  error?: Error;
  count: number;
}

export interface RepositoryMetadata {
  entityType: string;
  totalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepositoryStatistics {
  totalRepositories: number;
  totalEntities: number;
  repositoriesByType: Record<string, number>;
  cacheHitRate: number;
  totalTransactions: number;
  activeTransactions: number;
}

export interface RepositoryOptions {
  enableCache?: boolean;
  enableValidation?: boolean;
  enableEvents?: boolean;
  enableSoftDelete?: boolean;
}

export interface RepositoryTransactionOptions {
  timeoutMs?: number;
  isolationLevel?: 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';
}

export type TransactionStatus = 'pending' | 'active' | 'committed' | 'rolled_back';

export interface RepositoryTransaction {
  id: string;
  status: TransactionStatus;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface UpsertOptions<T> {
  insertData: Partial<T>;
  updateData: Partial<T>;
  filter: Filter<T>;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: { index: number; error: string }[];
}
