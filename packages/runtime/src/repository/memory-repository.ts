import type { EntityId } from '@storynaram/core';
import { BaseRepository } from './base-repository';
import { EntityCacheService } from '../entity-cache.service';
import { EntityEventService } from '../entity-event.service';
import { EntityValidationService } from '../entity-validation.service';
import { EntityLifecycleService } from '../entity-lifecycle.service';
import { RuntimeConfig } from '../runtime-config';
import { DefaultTransaction } from './repository-transaction';
import { RepositoryConflictError } from './errors';
import type { StorageProvider } from './storage-provider';
import type {
  Filter,
  PaginationInput,
  PaginatedResult,
  CursorInput,
  CursorResult,
  RepositoryTransaction,
} from './types';

class MemoryStorageProvider<T extends { entityId: EntityId }> implements StorageProvider<T> {
  private readonly store = new Map<string, T>();
  private transactionStack: Map<string, T>[] = [];
  private inTransaction = false;

  async create(entity: T): Promise<T> {
    const key = entity.entityId;
    if (this.store.has(key)) {
      throw new RepositoryConflictError('memory', key, 'Entity already exists');
    }
    const stored = this.clone(entity);
    this.store.set(key, stored);
    if (this.inTransaction) {
      this.transactionStack[this.transactionStack.length - 1]!.set(key, stored);
    }
    return this.clone(stored);
  }

  async insert(entities: T[]): Promise<T[]> {
    const results: T[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }

  async save(entity: T): Promise<T> {
    const key = entity.entityId;
    const stored = this.clone(entity);
    this.store.set(key, stored);
    if (this.inTransaction) {
      this.transactionStack[this.transactionStack.length - 1]!.set(key, stored);
    }
    return this.clone(stored);
  }

  async update(id: EntityId, changes: Partial<T>): Promise<T> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new RepositoryConflictError('memory', id, 'Entity not found for update');
    }
    const updated = this.clone({ ...existing, ...changes, entityId: id } as T);
    this.store.set(id, updated);
    if (this.inTransaction) {
      this.transactionStack[this.transactionStack.length - 1]!.set(id, updated);
    }
    return this.clone(updated);
  }

  async delete(id: EntityId): Promise<boolean> {
    const existed = this.store.has(id);
    this.store.delete(id);
    if (this.inTransaction) {
      this.transactionStack[this.transactionStack.length - 1]!.delete(id);
    }
    return existed;
  }

  async softDelete(id: EntityId): Promise<T> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new RepositoryConflictError('memory', id, 'Entity not found for soft delete');
    }
    const deleted = this.clone({ ...existing, deletedAt: new Date() } as T);
    this.store.set(id, deleted);
    if (this.inTransaction) {
      this.transactionStack[this.transactionStack.length - 1]!.set(id, deleted);
    }
    return this.clone(deleted);
  }

  async restore(id: EntityId): Promise<T> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new RepositoryConflictError('memory', id, 'Entity not found for restore');
    }
    const restored = this.clone({ ...existing, deletedAt: null } as T);
    this.store.set(id, restored);
    if (this.inTransaction) {
      this.transactionStack[this.transactionStack.length - 1]!.set(id, restored);
    }
    return this.clone(restored);
  }

  async findById(id: EntityId): Promise<T | undefined> {
    const item = this.store.get(id);
    return item ? this.clone(item) : undefined;
  }

  async findOne(filter?: Filter<T>): Promise<T | undefined> {
    const items = await this.findMany(filter);
    return items[0];
  }

  async findMany(filter?: Filter<T>): Promise<T[]> {
    let items = Array.from(this.store.values());
    if (filter) {
      items = this.applyFilter(items, filter);
    }
    return items.map(item => this.clone(item));
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.store.values()).map(item => this.clone(item));
  }

  async exists(id: EntityId): Promise<boolean> {
    return this.store.has(id);
  }

  async count(filter?: Filter<T>): Promise<number> {
    const items = await this.findMany(filter);
    return items.length;
  }

  async paginate(
    pagination: PaginationInput,
    filter?: Filter<T>,
    sort?: Record<string, 'asc' | 'desc'>,
  ): Promise<PaginatedResult<T>> {
    let items = Array.from(this.store.values());
    if (filter) {
      items = this.applyFilter(items, filter);
    }
    if (sort) {
      items = this.applySort(items, sort);
    }
    const total = items.length;
    const page = Math.max(1, pagination.page);
    const limit = Math.max(1, Math.min(1000, pagination.limit));
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const pageItems = items.slice(offset, offset + limit).map(item => this.clone(item));
    return {
      items: pageItems,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async cursor(
    input: CursorInput,
    filter?: Filter<T>,
    sort?: Record<string, 'asc' | 'desc'>,
  ): Promise<CursorResult<T>> {
    let items = Array.from(this.store.values());
    if (filter) {
      items = this.applyFilter(items, filter);
    }
    if (sort) {
      items = this.applySort(items, sort);
    }
    const limit = Math.max(1, Math.min(1000, input.limit));
    let startIndex = 0;
    if (input.cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(input.cursor, 'base64url').toString());
        const cursorId = decoded.id as string;
        const idx = items.findIndex(item => item.entityId === cursorId);
        if (idx >= 0) {
          startIndex = input.direction === 'backward' ? Math.max(0, idx - limit) : idx + 1;
        }
      } catch {
        startIndex = 0;
      }
    }
    const slice = items.slice(startIndex, startIndex + limit);
    const hasNext = startIndex + limit < items.length;
    const hasPrevious = startIndex > 0;
    const lastItem = slice[slice.length - 1];
    const firstItem = slice[0];
    return {
      items: slice.map(item => this.clone(item)),
      nextCursor: hasNext && lastItem ? this.encodeCursor(lastItem.entityId) : undefined,
      previousCursor: hasPrevious && firstItem ? this.encodeCursor(firstItem.entityId) : undefined,
      hasNext,
      hasPrevious,
    };
  }

  async *stream(filter?: Filter<T>): AsyncIterable<T> {
    const items = await this.findMany(filter);
    for (const item of items) {
      yield item;
    }
  }

  async beginTransaction(): Promise<RepositoryTransaction> {
    const snapshot = new Map(this.store);
    this.transactionStack.push(new Map(this.store));
    this.inTransaction = true;
    const tx = new DefaultTransaction(
      async () => {
        this.transactionStack.pop();
        this.inTransaction = this.transactionStack.length > 0;
      },
      async () => {
        this.transactionStack.pop();
        this.store.clear();
        for (const [k, v] of snapshot) {
          this.store.set(k, v);
        }
        this.inTransaction = this.transactionStack.length > 0;
      },
    );
    return tx;
  }

  supportsTransactions(): boolean {
    return true;
  }

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  private applyFilter(items: T[], filter: Filter<T>): T[] {
    let result = [...items];
    if (filter.conditions) {
      for (const cond of filter.conditions) {
        result = result.filter(item => this.evaluateCondition(item, cond));
      }
    }
    if (filter.or) {
      const orResults = new Set<T>();
      for (const sub of filter.or) {
        for (const item of this.applyFilter(items, sub)) {
          orResults.add(item);
        }
      }
      result = result.filter(item => orResults.has(item));
    }
    if (filter.and) {
      for (const sub of filter.and) {
        result = this.applyFilter(result, sub);
      }
    }
    return result;
  }

  private evaluateCondition(item: T, condition: { field: string; operator: string; value: unknown }): boolean {
    const value = (item as Record<string, unknown>)[condition.field];
    const expected = condition.value;
    switch (condition.operator) {
      case 'eq': return value === expected;
      case 'neq': return value !== expected;
      case 'gt': return (value as number) > (expected as number);
      case 'gte': return (value as number) >= (expected as number);
      case 'lt': return (value as number) < (expected as number);
      case 'lte': return (value as number) <= (expected as number);
      case 'in': return Array.isArray(expected) && expected.includes(value);
      case 'nin': return !Array.isArray(expected) || !expected.includes(value);
      case 'contains': return typeof value === 'string' && typeof expected === 'string' && value.includes(expected);
      case 'startsWith': return typeof value === 'string' && typeof expected === 'string' && value.startsWith(expected);
      case 'endsWith': return typeof value === 'string' && typeof expected === 'string' && value.endsWith(expected);
      case 'regex': return typeof value === 'string' && new RegExp(String(expected)).test(value);
      case 'between': {
        if (Array.isArray(expected) && expected.length === 2) {
          return (value as number) >= (expected[0] as number) && (value as number) <= (expected[1] as number);
        }
        return false;
      }
      default: return false;
    }
  }

  private applySort(items: T[], sort: Record<string, 'asc' | 'desc'>): T[] {
    const entries = Object.entries(sort);
    if (entries.length === 0) return items;
    return [...items].sort((a, b) => {
      for (const [field, direction] of entries) {
        const aVal = (a as Record<string, unknown>)[field] as string | number;
        const bVal = (b as Record<string, unknown>)[field] as string | number;
        if (aVal === bVal) continue;
        const cmp = aVal < bVal ? -1 : 1;
        return direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }

  private clone(item: T): T {
    return JSON.parse(JSON.stringify(item)) as T;
  }

  private encodeCursor(entityId: EntityId): string {
    return Buffer.from(JSON.stringify({ id: entityId })).toString('base64url');
  }
}

export class MemoryRepository<T extends { entityId: EntityId }> extends BaseRepository<T> {
  override readonly entityType: string;
  private readonly memoryProvider: MemoryStorageProvider<T>;

  constructor(
    entityType: string,
    cache?: EntityCacheService,
    events?: EntityEventService,
    validation?: EntityValidationService,
    lifecycle?: EntityLifecycleService,
    config?: RuntimeConfig,
  ) {
    const provider = new MemoryStorageProvider<T>();
    super(entityType, provider, cache, validation, events, lifecycle, config);
    this.entityType = entityType;
    this.memoryProvider = provider;
  }

  clear(): void {
    this.memoryProvider.clear();
  }

  get size(): number {
    return this.memoryProvider.size;
  }
}
