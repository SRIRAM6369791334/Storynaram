import { Injectable } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
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

  entityToRow<T extends Record<string, unknown>>(entity: T, mapping: TableMapping): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const col of mapping.columns) {
      const value = entity[col.propertyName as keyof T];
      if (value !== undefined) {
        row[col.columnName] = value;
      }
    }
    return row;
  }

  rowToEntity<T extends Record<string, unknown>>(row: Record<string, unknown>, mapping: TableMapping): T {
    const entity: Record<string, unknown> = {};
    for (const col of mapping.columns) {
      if (col.propertyName in row) {
        entity[col.propertyName] = row[col.propertyName];
      } else if (col.columnName in row) {
        entity[col.propertyName] = row[col.columnName];
      }
    }
    return entity as T;
  }

  rowsToEntities<T extends Record<string, unknown>>(rows: Record<string, unknown>[], mapping: TableMapping): T[] {
    return rows.map(r => this.rowToEntity<T>(r, mapping));
  }

  extractEntityId<T extends { entityId: EntityId }>(entity: T): EntityId {
    return entity.entityId;
  }

  getPrimaryKeyColumn(mapping: TableMapping): string {
    return mapping.primaryKey;
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
        { columnName: primaryKey, propertyName: 'entityId', type: 'text', primaryKey: true },
        { columnName: 'created_at', propertyName: 'createdAt', type: 'timestamptz', nullable: true },
        { columnName: 'updated_at', propertyName: 'updatedAt', type: 'timestamptz', nullable: true },
      ],
      primaryKey,
      softDeleteColumn: 'deleted_at',
      createdAtColumn: 'created_at',
      updatedAtColumn: 'updated_at',
    };
  }
}
