import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { SQLiteModule } from '../src/sqlite.module';
import { SQLITE_MODULE_OPTIONS, SQLITE_DATABASE } from '../src/tokens';
import { SQLiteConnection } from '../src/connection/sqlite-connection';

describe('SQLiteModule', () => {
  it('creates dynamic module with forRoot', () => {
    const mod = SQLiteModule.forRoot({ connection: { database: ':memory:' } });
    expect(mod.module).toBe(SQLiteModule);
    expect(mod.global).toBe(true);
    expect(mod.providers).toBeDefined();
  });

  it('creates dynamic module with forRootAsync', () => {
    const mod = SQLiteModule.forRootAsync({
      useFactory: () => ({ connection: { database: ':memory:' } }),
    });
    expect(mod.module).toBe(SQLiteModule);
    expect(mod.global).toBe(true);
    expect(mod.providers).toBeDefined();
  });

  it('forRootAsync useFactory is called', async () => {
    const mod = SQLiteModule.forRootAsync({
      useFactory: () => ({ connection: { database: ':memory:' } }),
    });
    const module = await Test.createTestingModule({ imports: [mod] }).compile();
    const opts = module.get(SQLITE_MODULE_OPTIONS);
    expect(opts).toBeDefined();
    expect(opts.connection.database).toBe(':memory:');
  });

  it('resolves database connection', async () => {
    const mod = SQLiteModule.forRoot({ connection: { database: ':memory:' } });
    const moduleRef = await Test.createTestingModule({ imports: [mod] }).compile();
    const conn = moduleRef.get(SQLiteConnection);
    expect(conn).toBeDefined();
    expect(conn.isInitialized()).toBe(true);
  });

  it('forFeature returns a dynamic module', () => {
    const mod = SQLiteModule.forFeature(['users', 'posts']);
    expect(mod.module).toBe(SQLiteModule);
    expect(mod.providers).toBeDefined();
  });
});
