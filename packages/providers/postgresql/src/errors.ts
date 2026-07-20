export class PostgreSQLProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostgreSQLProviderError';
  }
}

export class ConnectionError extends PostgreSQLProviderError {
  constructor(reason: string) {
    super(`PostgreSQL connection failed: ${reason}`);
    this.name = 'ConnectionError';
  }
}

export class PoolError extends PostgreSQLProviderError {
  constructor(reason: string) {
    super(`PostgreSQL pool error: ${reason}`);
    this.name = 'PoolError';
  }
}

export class QueryError extends PostgreSQLProviderError {
  constructor(reason: string) {
    super(`PostgreSQL query failed: ${reason}`);
    this.name = 'QueryError';
  }
}

export class MigrationError extends PostgreSQLProviderError {
  constructor(reason: string) {
    super(`Migration failed: ${reason}`);
    this.name = 'MigrationError';
  }
}

export class TransactionError extends PostgreSQLProviderError {
  constructor(reason: string) {
    super(`PostgreSQL transaction error: ${reason}`);
    this.name = 'TransactionError';
  }
}

export class ConfigurationError extends PostgreSQLProviderError {
  constructor(reason: string) {
    super(`PostgreSQL configuration error: ${reason}`);
    this.name = 'ConfigurationError';
  }
}
