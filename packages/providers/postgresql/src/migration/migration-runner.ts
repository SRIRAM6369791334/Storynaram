import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PostgreSQLConnection } from '../connection/postgresql-connection';
import { SchemaManager } from './schema-manager';
import { MigrationError } from '../errors';
import type { MigrationDefinition, MigrationRecord } from '../types';

@Injectable()
export class MigrationRunner {
  private readonly logger = new Logger(MigrationRunner.name);
  private readonly migrationsTable = '_migrations';

  constructor(
    private readonly connection: PostgreSQLConnection,
    private readonly schemaManager: SchemaManager,
  ) {}

  async ensureMigrationsTable(): Promise<void> {
    const exists = await this.schemaManager.tableExists(this.migrationsTable);
    if (!exists) {
      const mm = this.schemaManager.inferMigrationTableMapping();
      await this.schemaManager.createTable(this.migrationsTable, mm.columns);
    }
  }

  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    await this.ensureMigrationsTable();
    try {
      const result = await this.connection.execute<MigrationRecord>(
        `SELECT version, name, applied_at as "appliedAt", duration_ms as "durationMs", checksum FROM "${this.migrationsTable}" ORDER BY version ASC`,
      );
      return result.rows;
    } catch {
      return [];
    }
  }

  async runMigrations(
    migrations: MigrationDefinition[],
    direction: 'up' | 'down' = 'up',
    target?: string,
  ): Promise<MigrationRecord[]> {
    await this.ensureMigrationsTable();
    const applied = direction === 'up'
      ? await this.getAppliedMigrations()
      : [];

    const sorted = [...migrations].sort((a, b) => this.compareVersions(a.version, b.version));

    if (direction === 'up') {
      return this.runUpMigrations(sorted, applied, target);
    }
    return this.runDownMigrations(sorted, applied, target);
  }

  private async runUpMigrations(
    migrations: MigrationDefinition[],
    applied: MigrationRecord[],
    target?: string,
  ): Promise<MigrationRecord[]> {
    const appliedVersions = new Set(applied.map(r => r.version));
    const records: MigrationRecord[] = [];

    for (const migration of migrations) {
      if (appliedVersions.has(migration.version)) continue;
      if (target && this.compareVersions(migration.version, target) > 0) break;

      const record = await this.applyMigration(migration);
      records.push(record);
    }

    return records;
  }

  private async runDownMigrations(
    migrations: MigrationDefinition[],
    applied: MigrationRecord[],
    target?: string,
  ): Promise<MigrationRecord[]> {
    const appliedVersions = new Set(applied.map(r => r.version));
    const reversed = [...migrations].reverse();
    const records: MigrationRecord[] = [];

    for (const migration of reversed) {
      if (!appliedVersions.has(migration.version)) continue;
      if (target && this.compareVersions(migration.version, target) <= 0) break;

      const record = await this.revertMigration(migration);
      records.push(record);
    }

    return records;
  }

  private async applyMigration(migration: MigrationDefinition): Promise<MigrationRecord> {
    this.logger.log(`Applying migration ${migration.version}: ${migration.name}`);
    const start = Date.now();

    try {
      for (const stmt of migration.up) {
        await this.connection.execute(stmt);
      }
    } catch (err) {
      throw new MigrationError(`Migration ${migration.version} failed: ${(err as Error).message}`);
    }

    const durationMs = Date.now() - start;
    const checksum = this.computeChecksum(migration);

    await this.connection.execute(
      `INSERT INTO "${this.migrationsTable}" (version, name, applied_at, duration_ms, checksum) VALUES ($1, $2, NOW(), $3, $4)`,
      [migration.version, migration.name, durationMs, checksum],
    );

    this.logger.log(`Migration ${migration.version} applied in ${durationMs}ms`);
    return {
      version: migration.version,
      name: migration.name,
      appliedAt: new Date(),
      durationMs,
      checksum,
    };
  }

  private async revertMigration(migration: MigrationDefinition): Promise<MigrationRecord> {
    this.logger.log(`Reverting migration ${migration.version}: ${migration.name}`);
    const start = Date.now();

    if (!migration.down || migration.down.length === 0) {
      throw new MigrationError(`Migration ${migration.version} has no down statements`);
    }

    try {
      for (const stmt of migration.down) {
        await this.connection.execute(stmt);
      }
    } catch (err) {
      throw new MigrationError(`Migration revert ${migration.version} failed: ${(err as Error).message}`);
    }

    const durationMs = Date.now() - start;

    await this.connection.execute(
      `DELETE FROM "${this.migrationsTable}" WHERE version = $1`,
      [migration.version],
    );

    this.logger.log(`Migration ${migration.version} reverted in ${durationMs}ms`);
    return {
      version: migration.version,
      name: migration.name,
      appliedAt: new Date(),
      durationMs,
      checksum: '',
    };
  }

  async seed(statements: string[]): Promise<void> {
    this.logger.log('Running seed data');
    for (const stmt of statements) {
      await this.connection.execute(stmt);
    }
    this.logger.log('Seed data applied');
  }

  private computeChecksum(migration: MigrationDefinition): string {
    const content = JSON.stringify(migration);
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  }
}
