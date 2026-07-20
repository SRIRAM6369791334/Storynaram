import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SQLiteConnection } from '../src/connection/sqlite-connection';

describe('SQLiteConnection', () => {
  let conn: SQLiteConnection;

  beforeEach(async () => {
    conn = new SQLiteConnection();
    await conn.initialize({ database: ':memory:' });
  });

  afterEach(async () => {
    await conn.close();
  });

  it('executes SELECT', () => {
    const result = conn.execute('SELECT 1 as val');
    expect(result.rows[0]!.val).toBe(1);
    expect(result.rowCount).toBe(1);
  });

  it('executes INSERT and returns lastInsertRowid', () => {
    conn.execute('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    const result = conn.execute('INSERT INTO test (name) VALUES (?)', ['hello']);
    expect(result.lastInsertRowid).toBe(1);
    expect(result.changes).toBe(1);
  });

  it('executes parameterized queries', () => {
    conn.execute('CREATE TABLE t (id INTEGER PRIMARY KEY, val TEXT)');
    conn.execute('INSERT INTO t (val) VALUES (?)', ['a']);
    conn.execute('INSERT INTO t (val) VALUES (?)', ['b']);
    const result = conn.execute('SELECT * FROM t WHERE val = ?', ['a']);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]!.val).toBe('a');
  });

  it('has foreign keys enabled', () => {
    expect(conn.isForeignKeysEnabled()).toBe(true);
  });

  it('passes integrity check', () => {
    const result = conn.runIntegrityCheck();
    expect(result).toContain('ok');
  });

  it('returns page count and size', () => {
    expect(conn.getPageCount()).toBeGreaterThanOrEqual(0);
    expect(conn.getPageSize()).toBeGreaterThan(0);
  });

  it('throws on execute before initialize', async () => {
    const c = new SQLiteConnection();
    expect(() => c.execute('SELECT 1')).toThrow('Database not initialized');
  });

  it('throws ConnectionError on bad file path', async () => {
    const c = new SQLiteConnection();
    await expect(c.initialize({ database: 'Z:\\nonexistent\\dir\\db.sqlite' })).rejects.toThrow();
  });

  it('detects WAL mode with file-based database', async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'sqlite-test-'));
    const dbPath = join(tmpDir, 'test.db');
    try {
      const fc = new SQLiteConnection();
      await fc.initialize({ database: dbPath });
      expect(fc.isWalMode()).toBe(true);
      await fc.close();
    } finally {
      try { unlinkSync(dbPath); } catch { /* ok */ }
      try { unlinkSync(dbPath + '-wal'); } catch { /* ok */ }
      try { unlinkSync(dbPath + '-shm'); } catch { /* ok */ }
      try { unlinkSync(tmpDir); } catch { /* ok */ }
    }
  });
});
