import { Injectable } from '@nestjs/common';
import type { Filter, FilterCondition, FilterOperator, Sort } from '@storynaram/runtime';
import type { CompiledQuery } from '../types';

@Injectable()
export class QueryCompiler {
  compileWhere<T>(filter: Filter<T> | undefined, startIndex = 1): CompiledQuery {
    if (!filter) {
      return { sql: '', params: [] };
    }
    return this.compileFilterClause(filter, startIndex);
  }

  private compileFilterClause<T>(filter: Filter<T>, startIndex: number): CompiledQuery {
    const conditions: string[] = [];
    let params: unknown[] = [];
    let idx = startIndex;

    if (filter.conditions && filter.conditions.length > 0) {
      for (const cond of filter.conditions) {
        const result = this.compileCondition(cond, idx);
        conditions.push(result.sql);
        params.push(...result.params);
        idx += result.params.length;
      }
    }

    if (filter.and && filter.and.length > 0) {
      for (const sub of filter.and) {
        const result = this.compileFilterClause(sub, idx);
        conditions.push(`(${result.sql})`);
        params.push(...result.params);
        idx += result.params.length;
      }
    }

    if (filter.or && filter.or.length > 0) {
      const orParts: string[] = [];
      for (const sub of filter.or) {
        const result = this.compileFilterClause(sub, idx);
        orParts.push(`${result.sql}`);
        params.push(...result.params);
        idx += result.params.length;
      }
      if (orParts.length > 0) {
        conditions.push(`(${orParts.join(' OR ')})`);
      }
    }

    if (conditions.length === 0) {
      return { sql: '', params: [] };
    }

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  private compileCondition(cond: FilterCondition, startIndex: number): CompiledQuery {
    const field = this.quoteIdentifier(cond.field);
    const value = cond.value;
    const operator = cond.operator;

    switch (operator) {
      case 'eq':
        if (value === null) {
          return { sql: `${field} IS NULL`, params: [] };
        }
        return { sql: `${field} = $${startIndex}`, params: [value] };

      case 'neq':
        if (value === null) {
          return { sql: `${field} IS NOT NULL`, params: [] };
        }
        return { sql: `${field} <> $${startIndex}`, params: [value] };

      case 'gt':
        return { sql: `${field} > $${startIndex}`, params: [value] };
      case 'gte':
        return { sql: `${field} >= $${startIndex}`, params: [value] };
      case 'lt':
        return { sql: `${field} < $${startIndex}`, params: [value] };
      case 'lte':
        return { sql: `${field} <= $${startIndex}`, params: [value] };

      case 'in': {
        if (!Array.isArray(value) || value.length === 0) {
          return { sql: '1=0', params: [] };
        }
        const refs = value.map((_, i) => `$${startIndex + i}`);
        return { sql: `${field} IN (${refs.join(', ')})`, params: value };
      }

      case 'nin': {
        if (!Array.isArray(value) || value.length === 0) {
          return { sql: '1=1', params: [] };
        }
        const refs = value.map((_, i) => `$${startIndex + i}`);
        return { sql: `${field} NOT IN (${refs.join(', ')})`, params: value };
      }

      case 'contains':
        return { sql: `${field} LIKE $${startIndex}`, params: [`%${value}%`] };

      case 'startsWith':
        return { sql: `${field} LIKE $${startIndex}`, params: [`${value}%`] };

      case 'endsWith':
        return { sql: `${field} LIKE $${startIndex}`, params: [`%${value}`] };

      case 'regex': {
        return { sql: `${field} ~ $${startIndex}`, params: [value] };
      }

      case 'between': {
        if (!Array.isArray(value) || value.length < 2) {
          return { sql: '1=0', params: [] };
        }
        return { sql: `${field} BETWEEN $${startIndex} AND $${startIndex + 1}`, params: [value[0], value[1]] };
      }

      default:
        return { sql: `${field} = $${startIndex}`, params: [value] };
    }
  }

  compileSort<T>(sort: Sort<T>[] | undefined): string {
    if (!sort || sort.length === 0) {
      return '';
    }
    const parts = sort.map(s => `${this.quoteIdentifier(String(s.field))} ${s.direction.toUpperCase()}`);
    return `ORDER BY ${parts.join(', ')}`;
  }

  compilePagination(limit: number, offset: number, startIndex: number): CompiledQuery {
    return {
      sql: `LIMIT $${startIndex} OFFSET $${startIndex + 1}`,
      params: [limit, offset],
    };
  }

  compilePaginationInput(page: number, limit: number, startIndex: number): CompiledQuery {
    const offset = (page - 1) * limit;
    return this.compilePagination(limit, Math.max(0, offset), startIndex);
  }

  compileCursorPagination(limit: number, cursor?: string, direction: 'forward' | 'backward' = 'forward', sortFields: string[] = [], startIndex = 1): CompiledQuery {
    const params: unknown[] = [limit];
    let sql = `LIMIT $${startIndex}`;
    if (cursor && sortFields.length > 0) {
      const op = direction === 'forward' ? '>' : '<';
      const quotedFields = sortFields.map(f => this.quoteIdentifier(f));
      if (quotedFields.length === 1) {
        sql += ` AND ${quotedFields[0]} ${op} $${startIndex + 1}`;
        params.push(cursor);
      } else {
        sql += ` AND (${quotedFields.join(', ')}) ${op} (${params.map((_, i) => `$${startIndex + 1 + i}`).join(', ')})`;
        params.push(cursor);
      }
    }
    return { sql, params };
  }

  compileCountQuery(table: string, filter?: CompiledQuery): CompiledQuery {
    const baseSql = `SELECT COUNT(*) as count FROM ${this.quoteIdentifier(table)}`;
    if (filter && filter.sql) {
      return { sql: `${baseSql} WHERE ${filter.sql}`, params: filter.params };
    }
    return { sql: baseSql, params: [] };
  }

  compileSelectQuery(
    table: string,
    columns: string[] = ['*'],
    filter?: CompiledQuery,
    sort?: string,
    pagination?: CompiledQuery,
  ): CompiledQuery {
    const cols = columns.length === 1 && columns[0] === '*' ? '*' : columns.map(c => this.quoteIdentifier(c)).join(', ');
    let sql = `SELECT ${cols} FROM ${this.quoteIdentifier(table)}`;
    const params: unknown[] = [];

    if (filter && filter.sql) {
      sql += ` WHERE ${filter.sql}`;
      params.push(...filter.params);
    }
    if (sort) {
      sql += ` ${sort}`;
    }
    if (pagination) {
      sql += ` ${pagination.sql}`;
      params.push(...pagination.params);
    }

    return { sql, params };
  }

  private quoteIdentifier(name: string): string {
    return `"${name.replace(/"/g, '""')}"`;
  }
}
