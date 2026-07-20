import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteConnection } from '../src/connection/sqlite-connection';
import { TransactionManager } from '../src/transaction/transaction-manager';

describe('TransactionManager', () => {
  let conn: SQLiteConnection;
  let txnManager: TransactionManager;

  beforeEach(async () => {
    conn = new SQLiteConnection();
    await conn.initialize({ database: ':memory:' });
    conn.execute('CREATE TABLE test (id INTEGER PRIMARY KEY, val TEXT)');
    txnManager = new TransactionManager(conn);
  });

  afterEach(async () => {
    await conn.close();
  });

  it('begins a transaction', async () => {
    const txn = await txnManager.beginTransaction();
    expect(txn).toBeDefined();
    expect(txn.id).toBeDefined();
    expect(txn.isActive()).toBe(true);
  });

  it('commits a transaction', async () => {
    const txn = await txnManager.beginTransaction();
    conn.execute('INSERT INTO test (val) VALUES (?)', ['committed']);
    await txnManager.commitTransaction(txn);
    expect(txn.isActive()).toBe(false);
    const result = conn.execute('SELECT COUNT(*) as cnt FROM test');
    expect(result.rows[0]!.cnt).toBe(1);
  });

  it('rolls back a transaction', async () => {
    const txn = await txnManager.beginTransaction();
    conn.execute('INSERT INTO test (val) VALUES (?)', ['rolled_back']);
    await txnManager.rollbackTransaction(txn);
    const result = conn.execute('SELECT COUNT(*) as cnt FROM test');
    expect(result.rows[0]!.cnt).toBe(0);
  });

  it('tracks active count', async () => {
    expect(txnManager.getActiveCount()).toBe(0);
    const txn = await txnManager.beginTransaction();
    expect(txnManager.getActiveCount()).toBe(1);
    await txnManager.commitTransaction(txn);
    expect(txnManager.getActiveCount()).toBe(0);
  });

  it('supports nested transactions', () => {
    expect(txnManager.supportsNestedTransactions()).toBe(true);
  });

  it('transactions are isolated', async () => {
    const txn = await txnManager.beginTransaction();
    conn.execute('INSERT INTO test (val) VALUES (?)', ['in_txn']);
    const beforeRollback = conn.execute('SELECT COUNT(*) as cnt FROM test');
    expect(beforeRollback.rows[0]!.cnt).toBe(1);
    await txnManager.rollbackTransaction(txn);
    const afterRollback = conn.execute('SELECT COUNT(*) as cnt FROM test');
    expect(afterRollback.rows[0]!.cnt).toBe(0);
  });
});
