import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionManager } from '../src/transaction/transaction-manager';
import { ConnectionPool } from '../src/connection/connection-pool';

vi.mock('pg', () => {
  const mockClient = {
    release: vi.fn(),
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, command: '' }),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, command: '' }),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    totalCount: 1,
    idleCount: 1,
    waitingCount: 0,
  };
  return {
    default: {
      Pool: vi.fn(() => mockPool),
    },
    Pool: vi.fn(() => mockPool),
  };
});

describe('TransactionManager', () => {
  let pool: ConnectionPool;
  let txnManager: TransactionManager;

  beforeEach(async () => {
    vi.clearAllMocks();
    pool = new ConnectionPool();
    await pool.initialize({
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'test',
      password: 'test',
    });
    txnManager = new TransactionManager(pool);
  });

  it('begins a transaction', async () => {
    const txn = await txnManager.beginTransaction();
    expect(txn).toBeDefined();
    expect(txn.id).toBeDefined();
    expect(txn.status).toBe('active');
    expect(txn.isActive()).toBe(true);
  });

  it('commits a transaction', async () => {
    const txn = await txnManager.beginTransaction();
    await txnManager.commitTransaction(txn);
    expect(txn.status).toBe('committed');
    expect(txn.isActive()).toBe(false);
  });

  it('rolls back a transaction', async () => {
    const txn = await txnManager.beginTransaction();
    await txnManager.rollbackTransaction(txn);
    expect(txn.status).toBe('rolled_back');
    expect(txn.isActive()).toBe(false);
  });

  it('reports active transaction count', async () => {
    expect(txnManager.getActiveCount()).toBe(0);
    const txn = await txnManager.beginTransaction();
    expect(txnManager.getActiveCount()).toBe(1);
    await txnManager.commitTransaction(txn);
    expect(txnManager.getActiveCount()).toBe(0);
  });

  it('supports nested transactions', () => {
    expect(txnManager.supportsNestedTransactions()).toBe(true);
  });
});
