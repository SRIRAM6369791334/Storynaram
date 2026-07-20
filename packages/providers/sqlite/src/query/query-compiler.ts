import { Injectable } from '@nestjs/common';
import type { Filter, FilterCondition, FilterOperator, Sort } from '@storynaram/runtime';
import type { CompiledQuery } from '../types';

@Injectable()
export class QueryCompiler {
  compileWhere<T>(filter: Filter<T> | undefined): CompiledQuery {
    if (!filter) {
      return { sql: '', params: [] };
    }
    return this.compileFilterClause(filter);
  }

  private compileFilterClause<T>(filter: Filter<T>): CompiledQuery {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.conditions && filter.conditions.length > 0) {
      for (const cond of filter.conditions) {
        const result = this.compileCondition(cond);
        if (result.sql) {
          conditions.push(result.sql);
          params.push(...result.params);
        }
      }
    }

    if (filter.and && filter.and.length > 0) {
      for (const sub of filter.and) {
        const result = this.compileFilterClause(sub);
        if (result.sql) {
          conditions.push(`(${result.sql})`);
          params.push(...result.params);
        }
      }
    }

    if (filter.or && filter.or.length > 0) {
      const orParts: string[] = [];
      for (const sub of filter.or) {
        const result = this.compileFilterClause(sub);
        if (result.sql) {
          orParts.push(result.sql);
          params.push(...result.params);
        }
      }
      if (orParts.length > 0) {
        conditions.push(`(${orParts.join(' OR ')})`);
      }
    }

    if (conditions.length === 0) {
      return { sql: '', params: [] };
    }

    return { sql: conditions.join(' AND '), params };
  }

  private compileCondition(cond: FilterCondition): CompiledQuery {
    const field = this.quoteIdentifier(cond.field);
    const value = cond.value;
    const operator = cond.operator;

    switch (operator) {
      case 'eq':
        if (value === null) {
          return { sql: `${field} IS NULL`, params: [] };
        }
        return { sql: `${field} = ?`, params: [value] };

      case 'neq':
        if (value === null) {
          return { sql: `${field} IS NOT NULL`, params: [] };
        }
        return { sql: `${field} <> ?`, params: [value] };

      case 'gt':
        return { sql: `${field} > ?`, params: [value] };
      case 'gte':
        return { sql: `${field} >= ?`, params: [value] };
      case 'lt':
        return { sql: `${field} < ?`, params: [value] };
      case 'lte':
        return { sql: `${field} <= ?`, params: [value] };

      case 'in': {
        if (!Array.isArray(value) || value.length === 0) {
          return { sql: '0', params: [] };
        }
        const refs = value.map(() => '?');
        return { sql: `${field} IN (${refs.join(', ')})`, params: value };
      }

      case 'nin': {
        if (!Array.isArray(value) || value.length === 0) {
          return { sql: '1', params: [] };
        }
        const refs = value.map(() => '?');
        return { sql: `${field} NOT IN (${refs.join(', ')})`, params: value };
      }

      case 'contains':
        return { sql: `${field} LIKE ?`, params: [`%${value}%`] };
      case 'startsWith':
        return { sql: `${field} LIKE ?`, params: [`${value}%`] };
      case 'endsWith':
        return { sql: `${field} LIKE ?`, params: [`%${value}`] };

      case 'regex':
        return { sql: `${field} REGEXP ?`, params: [value] };

      case 'between': {
        if (!Array.isArray(value) || value.length < 2) {
          return { sql: '0', params: [] };
        }
        return { sql: `${field} BETWEEN ? AND ?`, params: [value[0], value[1]] };
      }

      default:
        return { sql: `${field} = ?`, params: [value] };
    }
  }

  compileSort<T>(sort: Sort<T>[] | undefined): string {
    if (!sort || sort.length === 0) {
      return '';
    }
    const parts = sort.map(s => `${this.quoteIdentifier(String(s.field))} ${s.direction.toUpperCase()}`);
    return `ORDER BY ${parts.join(', ')}`;
  }

  compilePagination(limit: number, offset: number): CompiledQuery {
    return {
      sql: 'LIMIT ? OFFSET ?',
      params: [limit, Math.max(0, offset)],
    };
  }

  compilePaginationInput(page: number, limit: number): CompiledQuery {
    const offset = (page - 1) * limit;
    return this.compilePagination(limit, offset);
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
