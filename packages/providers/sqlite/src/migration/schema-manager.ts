import { Injectable, Logger } from '@nestjs/common';
import { SQLiteConnection } from '../connection/sqlite-connection';
import type { ColumnMapping, TableMapping } from '../types';
import { MigrationError } from '../errors';

@Injectable()
export class SchemaManager {
  private readonly logger = new Logger(SchemaManager.name);

  constructor(private readonly connection: SQLiteConnection) {}

  tableExists(tableName: string): boolean {
    const result = this.connection.execute<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName],
    );
    return result.rows.length > 0;
  }

  createTable(tableName: string, columns: ColumnMapping[]): void {
    const colDefs = columns.map(col => this.columnToSQL(col));
    const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n)`;
    this.connection.execute(sql);
    this.logger.log(`Table "${tableName}" created`);
  }

  dropTable(tableName: string): void {
    this.connection.execute(`DROP TABLE IF EXISTS "${tableName}"`);
    this.logger.log(`Table "${tableName}" dropped`);
  }

  addColumn(tableName: string, column: ColumnMapping): void {
    const def = this.columnToSQL(column);
    this.connection.execute(`ALTER TABLE "${tableName}" ADD COLUMN ${def}`);
    this.logger.log(`Column "${column.columnName}" added to "${tableName}"`);
  }

  createIndex(tableName: string, column: string, unique = false): void {
    const uniqueStr = unique ? 'UNIQUE ' : '';
    const indexName = `idx_${tableName}_${column}`;
    this.connection.execute(`CREATE ${uniqueStr}INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" ("${column}")`);
    this.logger.log(`Index "${indexName}" created`);
  }

  createCompositeIndex(tableName: string, columns: string[], unique = false): void {
    const uniqueStr = unique ? 'UNIQUE ' : '';
    const indexName = `idx_${tableName}_${columns.join('_')}`;
    const cols = columns.map(c => `"${c}"`).join(', ');
    this.connection.execute(`CREATE ${uniqueStr}INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" (${cols})`);
    this.logger.log(`Composite index "${indexName}" created`);
  }

  columnInfo(tableName: string): ColumnMapping[] {
    const result = this.connection.execute<{ cid: number; name: string; type: string; notnull: number; dflt_value: unknown; pk: number }>(
      `PRAGMA table_info("${tableName}")`,
    );
    return result.rows.map(r => ({
      columnName: r.name,
      propertyName: r.name,
      type: r.type,
      primaryKey: r.pk === 1,
      nullable: r.notnull === 0,
      default: r.dflt_value,
    }));
  }

  private columnToSQL(col: ColumnMapping): string {
    const parts: string[] = [`"${col.columnName}"`, col.type];
    if (col.primaryKey) {
      parts.push('PRIMARY KEY');
    }
    if (!col.nullable) {
      parts.push('NOT NULL');
    }
    if (col.default !== undefined) {
      parts.push(`DEFAULT ${typeof col.default === 'string' ? `'${col.default}'` : String(col.default)}`);
    }
    return parts.join(' ');
  }

  inferMigrationTableMapping(): TableMapping {
    return {
      tableName: '_migrations',
      columns: [
        { columnName: 'version', propertyName: 'version', type: 'TEXT', primaryKey: true },
        { columnName: 'name', propertyName: 'name', type: 'TEXT', nullable: false },
        { columnName: 'applied_at', propertyName: 'appliedAt', type: 'TEXT', nullable: false },
        { columnName: 'duration_ms', propertyName: 'durationMs', type: 'INTEGER', nullable: false },
        { columnName: 'checksum', propertyName: 'checksum', type: 'TEXT', nullable: false },
      ],
      primaryKey: 'version',
    };
  }
}
