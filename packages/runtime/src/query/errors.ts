import { EntityRuntimeError } from '../errors.js';

export class QueryError extends EntityRuntimeError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'QueryError';
  }
}

export class QuerySyntaxError extends QueryError {
  constructor(message: string) {
    super(`Query syntax error: ${message}`, 'QUERY_SYNTAX_ERROR');
    this.name = 'QuerySyntaxError';
  }
}

export class QueryExecutionError extends QueryError {
  constructor(entityType: string, reason: string) {
    super(`Query execution failed for ${entityType}: ${reason}`, 'QUERY_EXECUTION_ERROR');
    this.name = 'QueryExecutionError';
  }
}

export class QueryOptimizationError extends QueryError {
  constructor(message: string) {
    super(`Query optimization error: ${message}`, 'QUERY_OPTIMIZATION_ERROR');
    this.name = 'QueryOptimizationError';
  }
}

export class QueryTimeoutError extends QueryError {
  constructor(entityType: string, timeoutMs: number) {
    super(`Query timeout after ${String(timeoutMs)}ms for ${entityType}`, 'QUERY_TIMEOUT');
    this.name = 'QueryTimeoutError';
  }
}
