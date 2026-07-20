import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type {
  StorageProvider,
  Filter,
  PaginationInput,
  PaginatedResult,
  CursorInput,
  CursorResult,
  RepositoryTransaction,
} from '@storynaram/runtime';
import { v4 as uuid } from 'uuid';
import { PostgreSQLConnection } from '../connection/postgresql-connection';
import { TransactionManager } from '../transaction/transaction-manager';
import { QueryCompiler } from '../query/query-compiler';
import { EntityMapper } from './entity-mapper';
import { MetricsCollector } from '../observability/metrics-collector';
import { QueryError } from '../errors';

@Injectable()
export class RepositoryAdapter<T extends { entityId: EntityId }> implements StorageProvider<T> {
  private readonly logger = new Logger(RepositoryAdapter.name);

  constructor(
    public readonly entityType: string,
    public readonly tableName: string,
    private readonly connection: PostgreSQLConnection,
    private readonly transactionManager: TransactionManager,
    private readonly queryCompiler: QueryCompiler,
    private readonly entityMapper: EntityMapper,
    private readonly metrics?: MetricsCollector,
  ) {
    const mapping = entityMapper.inferMapping(entityType, 'entity_id');
    mapping.tableName = tableName;
    entityMapper.registerMapping(entityType, mapping);
  }

  supportsTransactions(): boolean {
    return true;
  }

  async beginTransaction(): Promise<RepositoryTransaction> {
    return this.transactionManager.beginTransaction();
  }

  async create(entity: T): Promise<T> {
    const row = this.entityMapper.entityToRow(entity, this.getMapping());
    const query = this.buildInsertQuery(row);
    await this.execute(query.sql, query.params);
    this.metrics?.recordWrite();
    return entity;
  }

  async insert(entities: T[]): Promise<T[]> {
    if (entities.length === 0) return [];
    const rows = entities.map(e => this.entityMapper.entityToRow(e, this.getMapping()));
    const batch = this.buildBatchInsertQuery(rows);
    await this.execute(batch.sql, batch.params);
    this.metrics?.recordWrite(entities.length);
    return entities;
  }

  async save(entity: T): Promise<T> {
    const id = entity.entityId;
    const existing = await this.findById(id);
    if (existing) {
      return this.update(id, entity as Partial<T>);
    }
    return this.create(entity);
  }

  async update(id: EntityId, changes: Partial<T>): Promise<T> {
    const mapping = this.getMapping();
    const data = this.entityMapper.entityToRow(changes as Record<string, unknown>, mapping);
    const pkColumn = mapping.primaryKey;
    const query = this.buildUpdateQuery(data, pkColumn);
    query.params.push(id);
    const sql = `${query.sql} WHERE "${pkColumn}" = $${query.params.length}`;
    await this.execute(sql, query.params);
    const result = await this.findById(id);
    if (!result) {
      throw new QueryError(`Entity ${id} not found after update`);
    }
    this.metrics?.recordWrite();
    return result;
  }

  async delete(id: EntityId): Promise<boolean> {
    const mapping = this.getMapping();
    const sql = `DELETE FROM "${mapping.tableName}" WHERE "${mapping.primaryKey}" = $1`;
    const result = await this.execute(sql, [id]);
    this.metrics?.recordWrite();
    return result.rowCount > 0;
  }

  async softDelete(id: EntityId): Promise<T> {
    const mapping = this.getMapping();
    const softCol = mapping.softDeleteColumn ?? 'deleted_at';
    const sql = `UPDATE "${mapping.tableName}" SET "${softCol}" = NOW() WHERE "${mapping.primaryKey}" = $1`;
    await this.execute(sql, [id]);
    const result = await this.findById(id);
    if (!result) {
      throw new QueryError(`Entity ${id} not found after soft delete`);
    }
    return result;
  }

  async restore(id: EntityId): Promise<T> {
    const mapping = this.getMapping();
    const softCol = mapping.softDeleteColumn ?? 'deleted_at';
    const sql = `UPDATE "${mapping.tableName}" SET "${softCol}" = NULL WHERE "${mapping.primaryKey}" = $1`;
    await this.execute(sql, [id]);
    const result = await this.findById(id);
    if (!result) {
      throw new QueryError(`Entity ${id} not found after restore`);
    }
    return result;
  }

  async findById(id: EntityId): Promise<T | undefined> {
    const mapping = this.getMapping();
    const sql = `SELECT * FROM "${mapping.tableName}" WHERE "${mapping.primaryKey}" = $1`;
    const result = await this.execute(sql, [id]);
    this.metrics?.recordRead();
    if (result.rows.length === 0) return undefined;
    return result.rows[0] as unknown as T;
  }

  async findOne(filter: Filter<T>): Promise<T | undefined> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sql = where.sql
      ? `SELECT * FROM "${mapping.tableName}" WHERE ${where.sql} LIMIT 1`
      : `SELECT * FROM "${mapping.tableName}" LIMIT 1`;
    const result = await this.execute(sql, where.params);
    this.metrics?.recordRead();
    if (result.rows.length === 0) return undefined;
    return result.rows[0] as unknown as T;
  }

  async findMany(filter?: Filter<T>): Promise<T[]> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sql = where.sql
      ? `SELECT * FROM "${mapping.tableName}" WHERE ${where.sql}`
      : `SELECT * FROM "${mapping.tableName}"`;
    const result = await this.execute(sql, where.params);
    this.metrics?.recordRead(result.rows.length);
    return result.rows as unknown as T[];
  }

  async findAll(): Promise<T[]> {
    const mapping = this.getMapping();
    const sql = `SELECT * FROM "${mapping.tableName}"`;
    const result = await this.execute(sql);
    this.metrics?.recordRead(result.rows.length);
    return result.rows as unknown as T[];
  }

  async exists(id: EntityId): Promise<boolean> {
    const mapping = this.getMapping();
    const sql = `SELECT 1 FROM "${mapping.tableName}" WHERE "${mapping.primaryKey}" = $1 LIMIT 1`;
    const result = await this.execute(sql, [id]);
    return result.rowCount > 0;
  }

  async count(filter?: Filter<T>): Promise<number> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const cq = this.queryCompiler.compileCountQuery(mapping.tableName, where);
    const result = await this.execute(cq.sql, cq.params);
    return Number(result.rows[0]?.['count'] ?? 0);
  }

  async paginate(
    pagination: PaginationInput,
    filter?: Filter<T>,
    sort?: Record<string, 'asc' | 'desc'>,
  ): Promise<PaginatedResult<T>> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sortClause = sort ? this.compileSort(sort) : '';
    const paginationQuery = this.queryCompiler.compilePaginationInput(pagination.page, pagination.limit, where.params.length + 1);

    const countQuery = this.queryCompiler.compileCountQuery(mapping.tableName, where);
    const countResult = await this.execute(countQuery.sql, countQuery.params);
    const total = Number(countResult.rows[0]?.['count'] ?? 0);

    const selectQuery = this.queryCompiler.compileSelectQuery(
      mapping.tableName,
      ['*'],
      where,
      sortClause,
      paginationQuery,
    );
    const dataResult = await this.execute(selectQuery.sql, selectQuery.params);
    this.metrics?.recordRead(dataResult.rows.length);

    const totalPages = Math.ceil(total / pagination.limit);
    return {
      items: dataResult.rows as unknown as T[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrevious: pagination.page > 1,
    };
  }

  async cursor(
    input: CursorInput,
    filter?: Filter<T>,
    sort?: Record<string, 'asc' | 'desc'>,
  ): Promise<CursorResult<T>> {
    const mapping = this.getMapping();
    const sortFields = sort ? Object.keys(sort) : ['entity_id'];
    const where = this.queryCompiler.compileWhere(filter);
    const sortClause = sort ? this.compileSort(sort) : `ORDER BY "${mapping.primaryKey}" ASC`;
    const cursorPagination = this.queryCompiler.compileCursorPagination(
      input.limit + 1,
      input.cursor,
      input.direction ?? 'forward',
      sortFields,
      where.params.length + 1,
    );

    const selectQuery = this.queryCompiler.compileSelectQuery(
      mapping.tableName,
      ['*'],
      where,
      sortClause,
      cursorPagination,
    );
    const result = await this.execute(selectQuery.sql, selectQuery.params);
    this.metrics?.recordRead(result.rows.length);

    const hasMore = result.rows.length > input.limit;
    const items = hasMore ? result.rows.slice(0, input.limit) : result.rows;
    const lastItem = items[items.length - 1] as Record<string, unknown> | undefined;
    const firstItem = items[0] as Record<string, unknown> | undefined;

    return {
      items: items as unknown as T[],
      nextCursor: hasMore && lastItem ? String(lastItem[mapping.primaryKey]) : undefined,
      previousCursor: firstItem ? String(firstItem[mapping.primaryKey]) : undefined,
      hasNext: hasMore,
      hasPrevious: !!input.cursor,
    };
  }

  async *stream(filter?: Filter<T>): AsyncIterable<T> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sql = where.sql
      ? `SELECT * FROM "${mapping.tableName}" WHERE ${where.sql}`
      : `SELECT * FROM "${mapping.tableName}"`;

    const cursor = await this.connection.acquireDirectClient();
    try {
      const result = await cursor.query(sql, where.params);
      for (const row of result.rows) {
        yield row as unknown as T;
      }
    } finally {
      cursor.release();
    }
  }

  private getMapping() {
    const mapping = this.entityMapper.getMapping(this.entityType);
    if (!mapping) {
      throw new QueryError(`No mapping registered for entity type: ${this.entityType}`);
    }
    return mapping;
  }

  private buildInsertQuery(data: Record<string, unknown>): { sql: string; params: unknown[] } {
    const mapping = this.getMapping();
    const columns = Object.keys(data);
    const values = Object.values(data);
    const paramRefs = values.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO "${mapping.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${paramRefs.join(', ')})`;
    return { sql, params: values };
  }

  private buildUpdateQuery(data: Record<string, unknown>, pkColumn: string): { sql: string; params: unknown[] } {
    const mapping = this.getMapping();
    const entries = Object.entries(data).filter(([key]) => key !== pkColumn);
    const setClauses = entries.map(([col], i) => `"${col}" = $${i + 1}`);
    const params = entries.map(([, val]) => val);
    const sql = `UPDATE "${mapping.tableName}" SET ${setClauses.join(', ')}`;
    return { sql, params };
  }

  private buildBatchInsertQuery(rows: Record<string, unknown>[]): { sql: string; params: unknown[] } {
    const mapping = this.getMapping();
    if (rows.length === 0) return { sql: '', params: [] };
    const columns = Object.keys(rows[0]!);
    const params: unknown[] = [];
    const valueRows: string[] = [];

    for (const row of rows) {
      const refs: string[] = [];
      for (const col of columns) {
        params.push(row[col]);
        refs.push(`$${params.length}`);
      }
      valueRows.push(`(${refs.join(', ')})`);
    }

    const sql = `INSERT INTO "${mapping.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${valueRows.join(', ')}`;
    return { sql, params };
  }

  private compileSort(sort: Record<string, 'asc' | 'desc'>): string {
    const parts = Object.entries(sort).map(([field, dir]) => `"${field}" ${dir}`);
    return `ORDER BY ${parts.join(', ')}`;
  }

  private async execute(sql: string, params?: unknown[]) {
    return this.connection.execute(sql, params);
  }
}
