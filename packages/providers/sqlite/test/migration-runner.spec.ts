import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteConnection } from '../src/connection/sqlite-connection';
import { SchemaManager } from '../src/migration/schema-manager';
import { MigrationRunner } from '../src/migration/migration-runner';

describe('MigrationRunner', () => {
  let conn: SQLiteConnection;
  let schemaManager: SchemaManager;
  let runner: MigrationRunner;

  const migration = {
    version: '1',
    name: 'create_users',
    up: ['CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)'],
    down: ['DROP TABLE IF EXISTS users'],
  };

  beforeEach(async () => {
    conn = new SQLiteConnection();
    await conn.initialize({ database: ':memory:' });
    schemaManager = new SchemaManager(conn);
    runner = new MigrationRunner(conn, schemaManager);
  });

  afterEach(async () => {
    await conn.close();
  });

  it('runs a migration up', () => {
    runner.runMigrations([migration]);
    const info = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    expect(info.rows).toHaveLength(1);
  });

  it('runs a migration down', () => {
    runner.runMigrations([migration]);
    runner.runMigrations([migration], 'down');
    const info = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    expect(info.rows).toHaveLength(0);
  });

  it('tracks applied migrations', () => {
    runner.runMigrations([migration]);
    const applied = runner.getAppliedMigrations();
    expect(applied).toHaveLength(1);
    expect(applied[0]!.version).toBe('1');
  });

  it('runs all pending migrations', () => {
    const m2 = {
      version: '2',
      name: 'create_posts',
      up: ['CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT)'],
      down: ['DROP TABLE IF EXISTS posts'],
    };
    runner.runMigrations([migration]);
    runner.runMigrations([m2]);
    const app2 = runner.getAppliedMigrations();
    expect(app2).toHaveLength(2);
  });

  it('runs seeds after migrations', () => {
    runner.runMigrations([migration]);
    runner.seed(["INSERT INTO users (name) VALUES ('seed_user')"]);
    const rows = conn.execute('SELECT COUNT(*) as cnt FROM users');
    expect(rows.rows[0]!.cnt).toBe(1);
  });
});
