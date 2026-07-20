import { Injectable, Logger } from '@nestjs/common';
import { PostgreSQLConnection } from '../connection/postgresql-connection';
import { MigrationError } from '../errors';
import type { ColumnMapping, TableMapping } from '../types';

@Injectable()
export class SchemaManager {
  private readonly logger = new Logger(SchemaManager.name);

  constructor(private readonly connection: PostgreSQLConnection) {}

  async tableExists(tableName: string): Promise<boolean> {
    const result = await this.connection.execute<{ exists: boolean }>(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1 AND table_schema = 'public') as "exists"`,
      [tableName],
    );
    return result.rows[0]?.exists ?? false;
  }

  async createTable(tableName: string, columns: ColumnMapping[]): Promise<void> {
    const colDefs = columns.map(col => this.columnToSQL(col));
    const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n)`;
    await this.connection.execute(sql);
    this.logger.log(`Table "${tableName}" created`);
  }

  async dropTable(tableName: string): Promise<void> {
    await this.connection.execute(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    this.logger.log(`Table "${tableName}" dropped`);
  }

  async addColumn(tableName: string, column: ColumnMapping): Promise<void> {
    const def = this.columnToSQL(column);
    await this.connection.execute(`ALTER TABLE "${tableName}" ADD COLUMN ${def}`);
    this.logger.log(`Column "${column.columnName}" added to "${tableName}"`);
  }

  async dropColumn(tableName: string, columnName: string): Promise<void> {
    await this.connection.execute(`ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}"`);
    this.logger.log(`Column "${columnName}" dropped from "${tableName}"`);
  }

  async createIndex(tableName: string, column: string, unique = false): Promise<void> {
    const uniqueStr = unique ? 'UNIQUE ' : '';
    const indexName = `idx_${tableName}_${column}`;
    await this.connection.execute(
      `CREATE ${uniqueStr}INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" ("${column}")`,
    );
    this.logger.log(`Index "${indexName}" created on "${tableName}"("${column}")`);
  }

  async createCompositeIndex(tableName: string, columns: string[], unique = false): Promise<void> {
    const uniqueStr = unique ? 'UNIQUE ' : '';
    const indexName = `idx_${tableName}_${columns.join('_')}`;
    const cols = columns.map(c => `"${c}"`).join(', ');
    await this.connection.execute(`CREATE ${uniqueStr}INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" (${cols})`);
    this.logger.log(`Composite index "${indexName}" created on "${tableName}"(${cols})`);
  }

  async tableInfo(tableName: string): Promise<{ columnName: string; dataType: string; nullable: boolean }[]> {
    const result = await this.connection.execute<{ column_name: string; data_type: string; is_nullable: string }>(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public' ORDER BY ordinal_position`,
      [tableName],
    );
    return result.rows.map(r => ({
      columnName: r.column_name,
      dataType: r.data_type,
      nullable: r.is_nullable === 'YES',
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
        { columnName: 'version', propertyName: 'version', type: 'VARCHAR(255)', primaryKey: true },
        { columnName: 'name', propertyName: 'name', type: 'VARCHAR(255)', nullable: false },
        { columnName: 'applied_at', propertyName: 'appliedAt', type: 'TIMESTAMPTZ', nullable: false, default: 'NOW()' },
        { columnName: 'duration_ms', propertyName: 'durationMs', type: 'INTEGER', nullable: false },
        { columnName: 'checksum', propertyName: 'checksum', type: 'VARCHAR(64)', nullable: false },
      ],
      primaryKey: 'version',
    };
  }
}
