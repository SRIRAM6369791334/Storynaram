export class QueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryError';
  }
}

export class QuerySyntaxError extends QueryError {
  constructor(message: string) {
    super(`Query syntax error: ${message}`);
    this.name = 'QuerySyntaxError';
  }
}

export class QueryExecutionError extends QueryError {
  constructor(entityType: string, reason: string) {
    super(`Query execution failed for ${entityType}: ${reason}`);
    this.name = 'QueryExecutionError';
  }
}

export class QueryOptimizationError extends QueryError {
  constructor(message: string) {
    super(`Query optimization error: ${message}`);
    this.name = 'QueryOptimizationError';
  }
}

export class QueryTimeoutError extends QueryError {
  constructor(entityType: string, timeoutMs: number) {
    super(`Query timeout after ${String(timeoutMs)}ms for ${entityType}`);
    this.name = 'QueryTimeoutError';
  }
}
