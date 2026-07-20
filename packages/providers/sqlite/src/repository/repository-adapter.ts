import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type {
  StorageProvider, Filter, PaginationInput, PaginatedResult,
  CursorInput, CursorResult, RepositoryTransaction,
} from '@storynaram/runtime';
import { SQLiteConnection } from '../connection/sqlite-connection';
import { TransactionManager } from '../transaction/transaction-manager';
import { QueryCompiler } from '../query/query-compiler';
import { EntityMapper } from './entity-mapper';
import { QueryError } from '../errors';

@Injectable()
export class RepositoryAdapter<T extends { entityId: EntityId }> implements StorageProvider<T> {
  private readonly logger = new Logger(RepositoryAdapter.name);

  constructor(
    public readonly entityType: string,
    public readonly tableName: string,
    private readonly connection: SQLiteConnection,
    private readonly transactionManager: TransactionManager,
    private readonly queryCompiler: QueryCompiler,
    private readonly entityMapper: EntityMapper,
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
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map(() => '?');
    const sql = `INSERT INTO "${this.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`;
    this.connection.execute(sql, values);
    return entity;
  }

  async insert(entities: T[]): Promise<T[]> {
    if (entities.length === 0) return [];
    const rows = entities.map(e => this.entityMapper.entityToRow(e, this.getMapping()));
    const columns = Object.keys(rows[0]!);
    const placeholders = rows.map(() => `(${columns.map(() => '?').join(', ')})`);
    const sql = `INSERT INTO "${this.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${placeholders.join(', ')}`;
    const params = rows.flatMap(r => columns.map(col => r[col]));
    this.connection.execute(sql, params);
    return entities;
  }

  async save(entity: T): Promise<T> {
    const existing = await this.findById(entity.entityId);
    if (existing) {
      return this.update(entity.entityId, entity as Partial<T>);
    }
    return this.create(entity);
  }

  async update(id: EntityId, changes: Partial<T>): Promise<T> {
    const mapping = this.getMapping();
    const data = this.entityMapper.entityToRow(changes as Record<string, unknown>, mapping);
    const pkColumn = mapping.primaryKey;
    delete data[pkColumn];
    const setClauses = Object.keys(data).map(k => `"${k}" = ?`);
    const values = Object.values(data);
    const sql = `UPDATE "${this.tableName}" SET ${setClauses.join(', ')} WHERE "${pkColumn}" = ?`;
    this.connection.execute(sql, [...values, id]);
    const result = await this.findById(id);
    if (!result) {
      throw new QueryError(`Entity ${id} not found after update`);
    }
    return result;
  }

  async delete(id: EntityId): Promise<boolean> {
    const mapping = this.getMapping();
    const sql = `DELETE FROM "${this.tableName}" WHERE "${mapping.primaryKey}" = ?`;
    const result = this.connection.execute(sql, [id]);
    return (result.changes ?? 0) > 0;
  }

  async softDelete(id: EntityId): Promise<T> {
    const mapping = this.getMapping();
    const softCol = mapping.softDeleteColumn ?? 'deleted_at';
    const sql = `UPDATE "${this.tableName}" SET "${softCol}" = ? WHERE "${mapping.primaryKey}" = ?`;
    this.connection.execute(sql, [new Date().toISOString(), id]);
    const result = await this.findById(id);
    if (!result) {
      throw new QueryError(`Entity ${id} not found after soft delete`);
    }
    return result;
  }

  async restore(id: EntityId): Promise<T> {
    const mapping = this.getMapping();
    const softCol = mapping.softDeleteColumn ?? 'deleted_at';
    const sql = `UPDATE "${this.tableName}" SET "${softCol}" = NULL WHERE "${mapping.primaryKey}" = ?`;
    this.connection.execute(sql, [id]);
    const result = await this.findById(id);
    if (!result) {
      throw new QueryError(`Entity ${id} not found after restore`);
    }
    return result;
  }

  async findById(id: EntityId): Promise<T | undefined> {
    const mapping = this.getMapping();
    const sql = `SELECT * FROM "${this.tableName}" WHERE "${mapping.primaryKey}" = ?`;
    const result = this.connection.execute<Record<string, unknown>>(sql, [id]);
    if (result.rows.length === 0) return undefined;
    return this.entityMapper.rowToEntity<T>(result.rows[0]!, mapping);
  }

  async findOne(filter: Filter<T>): Promise<T | undefined> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sql = where.sql
      ? `SELECT * FROM "${this.tableName}" WHERE ${where.sql} LIMIT 1`
      : `SELECT * FROM "${this.tableName}" LIMIT 1`;
    const result = this.connection.execute<Record<string, unknown>>(sql, where.params);
    if (result.rows.length === 0) return undefined;
    return this.entityMapper.rowToEntity<T>(result.rows[0]!, mapping);
  }

  async findMany(filter?: Filter<T>): Promise<T[]> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sql = where.sql
      ? `SELECT * FROM "${this.tableName}" WHERE ${where.sql}`
      : `SELECT * FROM "${this.tableName}"`;
    const result = this.connection.execute<Record<string, unknown>>(sql, where.params);
    return result.rows.map(r => this.entityMapper.rowToEntity<T>(r, mapping));
  }

  async findAll(): Promise<T[]> {
    const mapping = this.getMapping();
    const sql = `SELECT * FROM "${this.tableName}"`;
    const result = this.connection.execute<Record<string, unknown>>(sql);
    return result.rows.map(r => this.entityMapper.rowToEntity<T>(r, mapping));
  }

  async exists(id: EntityId): Promise<boolean> {
    const mapping = this.getMapping();
    const sql = `SELECT 1 FROM "${this.tableName}" WHERE "${mapping.primaryKey}" = ? LIMIT 1`;
    const result = this.connection.execute(sql, [id]);
    return result.rowCount > 0;
  }

  async count(filter?: Filter<T>): Promise<number> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const cq = this.queryCompiler.compileCountQuery(mapping.tableName, where);
    const result = this.connection.execute(cq.sql, cq.params);
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
    const paginationQuery = this.queryCompiler.compilePaginationInput(pagination.page, pagination.limit);

    const countQuery = this.queryCompiler.compileCountQuery(mapping.tableName, where);
    const countResult = this.connection.execute(countQuery.sql, countQuery.params);
    const total = Number(countResult.rows[0]?.['count'] ?? 0);

    const selectQuery = this.queryCompiler.compileSelectQuery(mapping.tableName, ['*'], where, sortClause, paginationQuery);
    const dataResult = this.connection.execute<Record<string, unknown>>(selectQuery.sql, selectQuery.params);

    const totalPages = Math.ceil(total / pagination.limit);
    return {
      items: dataResult.rows.map(r => this.entityMapper.rowToEntity<T>(r, mapping)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrevious: pagination.page > 1,
    };
  }

  async cursor(input: CursorInput, filter?: Filter<T>, sort?: Record<string, 'asc' | 'desc'>): Promise<CursorResult<T>> {
    const mapping = this.getMapping();
    const where = this.queryCompiler.compileWhere(filter);
    const sortClause = sort ? this.compileSort(sort) : `ORDER BY "${mapping.primaryKey}" ASC`;
    const sortFields = sort ? Object.keys(sort) : [mapping.primaryKey];

    const params: unknown[] = [...where.params];
    let cursorClause = '';
    if (input.cursor && sortFields.length > 0) {
      const op = (input.direction ?? 'forward') === 'forward' ? '>' : '<';
      cursorClause = ` AND "${sortFields[0]}" ${op} ?`;
      params.push(input.cursor);
    }

    const sql = `SELECT * FROM "${this.tableName}"${where.sql ? ` WHERE ${where.sql}` : ''}${cursorClause} ${sortClause} LIMIT ?`;
    params.push(input.limit + 1);

    const result = this.connection.execute<Record<string, unknown>>(sql, params);
    const hasMore = result.rows.length > input.limit;
    const rawItems = hasMore ? result.rows.slice(0, input.limit) : result.rows;
    const items = rawItems.map(r => this.entityMapper.rowToEntity<T>(r, mapping));
    const lastItem = items[items.length - 1] as Record<string, unknown> | undefined;
    const firstItem = items[0] as Record<string, unknown> | undefined;

    return {
      items,
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
      ? `SELECT * FROM "${this.tableName}" WHERE ${where.sql}`
      : `SELECT * FROM "${this.tableName}"`;
    const result = this.connection.execute<Record<string, unknown>>(sql, where.params);
    for (const row of result.rows) {
      yield this.entityMapper.rowToEntity<T>(row, mapping);
    }
  }

  private getMapping() {
    const mapping = this.entityMapper.getMapping(this.entityType);
    if (!mapping) {
      throw new QueryError(`No mapping registered for entity type: ${this.entityType}`);
    }
    return mapping;
  }

  private compileSort(sort: Record<string, 'asc' | 'desc'>): string {
    const parts = Object.entries(sort).map(([field, dir]) => `"${field}" ${dir}`);
    return `ORDER BY ${parts.join(', ')}`;
  }
}
