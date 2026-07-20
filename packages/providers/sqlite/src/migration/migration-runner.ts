import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { SQLiteConnection } from '../connection/sqlite-connection';
import { SchemaManager } from './schema-manager';
import { MigrationError } from '../errors';
import type { MigrationDefinition, MigrationRecord } from '../types';

@Injectable()
export class MigrationRunner {
  private readonly logger = new Logger(MigrationRunner.name);
  private readonly migrationsTable = '_migrations';

  constructor(
    private readonly connection: SQLiteConnection,
    private readonly schemaManager: SchemaManager,
  ) {}

  ensureMigrationsTable(): void {
    if (!this.schemaManager.tableExists(this.migrationsTable)) {
      const mm = this.schemaManager.inferMigrationTableMapping();
      this.schemaManager.createTable(this.migrationsTable, mm.columns);
    }
  }

  getAppliedMigrations(): MigrationRecord[] {
    this.ensureMigrationsTable();
    try {
      const result = this.connection.execute<MigrationRecord>(
        `SELECT version, name, applied_at as "appliedAt", duration_ms as "durationMs", checksum FROM "${this.migrationsTable}" ORDER BY version ASC`,
      );
      return result.rows.map(r => ({
        ...r,
        appliedAt: String(r.appliedAt),
      }));
    } catch {
      return [];
    }
  }

  runMigrations(migrations: MigrationDefinition[], direction: 'up' | 'down' = 'up', target?: string): MigrationRecord[] {
    this.ensureMigrationsTable();
    const applied = this.getAppliedMigrations();
    const sorted = [...migrations].sort((a, b) => this.compareVersions(a.version, b.version));

    if (direction === 'up') {
      return this.runUpMigrations(sorted, applied, target);
    }
    return this.runDownMigrations(sorted, applied, target);
  }

  private runUpMigrations(migrations: MigrationDefinition[], applied: MigrationRecord[], target?: string): MigrationRecord[] {
    const appliedVersions = new Set(applied.map(r => r.version));
    const records: MigrationRecord[] = [];

    for (const migration of migrations) {
      if (appliedVersions.has(migration.version)) continue;
      if (target && this.compareVersions(migration.version, target) > 0) break;
      const record = this.applyMigration(migration);
      records.push(record);
    }

    return records;
  }

  private runDownMigrations(migrations: MigrationDefinition[], applied: MigrationRecord[], target?: string): MigrationRecord[] {
    const appliedVersions = new Set(applied.map(r => r.version));
    const reversed = [...migrations].reverse();
    const records: MigrationRecord[] = [];

    for (const migration of reversed) {
      if (!appliedVersions.has(migration.version)) continue;
      if (target && this.compareVersions(migration.version, target) <= 0) break;
      const record = this.revertMigration(migration);
      records.push(record);
    }

    return records;
  }

  private applyMigration(migration: MigrationDefinition): MigrationRecord {
    this.logger.log(`Applying migration ${migration.version}: ${migration.name}`);
    const start = Date.now();

    try {
      for (const stmt of migration.up) {
        this.connection.execute(stmt);
      }
    } catch (err) {
      throw new MigrationError(`Migration ${migration.version} failed: ${(err as Error).message}`);
    }

    const durationMs = Date.now() - start;
    const checksum = this.computeChecksum(migration);
    const now = new Date().toISOString();

    this.connection.execute(
      `INSERT INTO "${this.migrationsTable}" (version, name, applied_at, duration_ms, checksum) VALUES (?, ?, ?, ?, ?)`,
      [migration.version, migration.name, now, durationMs, checksum],
    );

    this.logger.log(`Migration ${migration.version} applied in ${durationMs}ms`);
    return { version: migration.version, name: migration.name, appliedAt: now, durationMs, checksum };
  }

  private revertMigration(migration: MigrationDefinition): MigrationRecord {
    this.logger.log(`Reverting migration ${migration.version}: ${migration.name}`);
    const start = Date.now();

    if (!migration.down || migration.down.length === 0) {
      throw new MigrationError(`Migration ${migration.version} has no down statements`);
    }

    try {
      for (const stmt of migration.down) {
        this.connection.execute(stmt);
      }
    } catch (err) {
      throw new MigrationError(`Migration revert ${migration.version} failed: ${(err as Error).message}`);
    }

    const durationMs = Date.now() - start;
    this.connection.execute(`DELETE FROM "${this.migrationsTable}" WHERE version = ?`, [migration.version]);

    this.logger.log(`Migration ${migration.version} reverted in ${durationMs}ms`);
    return { version: migration.version, name: migration.name, appliedAt: '', durationMs, checksum: '' };
  }

  seed(statements: string[]): void {
    this.logger.log('Running seed data');
    for (const stmt of statements) {
      this.connection.execute(stmt);
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
