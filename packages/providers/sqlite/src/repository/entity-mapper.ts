import { Injectable } from '@nestjs/common';
import type { ColumnMapping, TableMapping } from '../types';

@Injectable()
export class EntityMapper {
  private readonly mappings = new Map<string, TableMapping>();

  registerMapping(entityType: string, mapping: TableMapping): void {
    this.mappings.set(entityType, mapping);
  }

  getMapping(entityType: string): TableMapping | undefined {
    return this.mappings.get(entityType);
  }

  hasMapping(entityType: string): boolean {
    return this.mappings.has(entityType);
  }

  rowsToEntities<T extends Record<string, unknown>>(rows: Record<string, unknown>[], mapping: TableMapping): T[] {
    return rows.map(r => this.rowToEntity<T>(r, mapping));
  }

  getTableName(entityType: string): string {
    const mapping = this.mappings.get(entityType);
    if (!mapping) {
      const snake = entityType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      return snake;
    }
    return mapping.tableName;
  }

  inferMapping(entityType: string, primaryKey = 'entity_id'): TableMapping {
    return {
      tableName: this.getTableName(entityType),
      columns: [
        { columnName: primaryKey, propertyName: 'entityId', type: 'TEXT', primaryKey: true },
        { columnName: 'created_at', propertyName: 'createdAt', type: 'TEXT', nullable: true },
        { columnName: 'updated_at', propertyName: 'updatedAt', type: 'TEXT', nullable: true },
      ],
      primaryKey,
      softDeleteColumn: 'deleted_at',
      createdAtColumn: 'created_at',
      updatedAtColumn: 'updated_at',
    };
  }

  entityToRow<T extends Record<string, unknown>>(entity: T, mapping: TableMapping): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    const knownPropertyToColumn = new Map(mapping.columns.map(c => [c.propertyName, c.columnName]));

    for (const col of mapping.columns) {
      const value = entity[col.propertyName as keyof T];
      if (value !== undefined) {
        row[col.columnName] = this.serializeValue(value);
      }
    }

    for (const key of Object.keys(entity)) {
      if (!knownPropertyToColumn.has(key)) {
        const columnName = this.camelToSnake(key);
        row[columnName] = this.serializeValue(entity[key]);
      }
    }

    return row;
  }

  rowToEntity<T extends Record<string, unknown>>(row: Record<string, unknown>, mapping: TableMapping): T {
    const entity: Record<string, unknown> = {};
    const knownColumnNames = new Set(mapping.columns.map(c => c.columnName));

    for (const col of mapping.columns) {
      const raw = col.columnName in row ? row[col.columnName] : row[col.propertyName];
      entity[col.propertyName] = this.deserializeValue(raw, col.type);
    }

    for (const key of Object.keys(row)) {
      if (!knownColumnNames.has(key)) {
        const propertyName = this.snakeToCamel(key);
        entity[propertyName] = row[key];
      }
    }

    return entity as T;
  }

  private camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private serializeValue(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value;
  }

  private deserializeValue(value: unknown, type: string): unknown {
    if (value === null || value === undefined) return value;
    const upper = type.toUpperCase();
    if (upper === 'TIMESTAMPTZ' || upper === 'TIMESTAMP' || upper === 'DATETIME' || upper === 'TEXT' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value as string)) {
      return value;
    }
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  }
}
