export class SQLiteProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SQLiteProviderError';
  }
}

export class ConnectionError extends SQLiteProviderError {
  constructor(reason: string) {
    super(`SQLite connection failed: ${reason}`);
    this.name = 'ConnectionError';
  }
}

export class QueryError extends SQLiteProviderError {
  constructor(reason: string) {
    super(`SQLite query failed: ${reason}`);
    this.name = 'QueryError';
  }
}

export class MigrationError extends SQLiteProviderError {
  constructor(reason: string) {
    super(`Migration failed: ${reason}`);
    this.name = 'MigrationError';
  }
}

export class TransactionError extends SQLiteProviderError {
  constructor(reason: string) {
    super(`SQLite transaction error: ${reason}`);
    this.name = 'TransactionError';
  }
}

export class ConfigurationError extends SQLiteProviderError {
  constructor(reason: string) {
    super(`SQLite configuration error: ${reason}`);
    this.name = 'ConfigurationError';
  }
}
