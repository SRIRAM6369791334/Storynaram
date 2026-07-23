import { EntityRuntimeError } from '../errors.js';

export class RepositoryError extends EntityRuntimeError {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class RepositoryNotFoundError extends RepositoryError {
  constructor(entityType: string, id: string) {
    super(`Repository ${entityType}: entity ${id} not found`);
    this.name = 'RepositoryNotFoundError';
  }
}

export class RepositoryConflictError extends RepositoryError {
  constructor(entityType: string, id: string, reason?: string) {
    const msg = reason ? `: ${reason}` : '';
    super(`Repository ${entityType}: conflict for entity ${id}${msg}`);
    this.name = 'RepositoryConflictError';
  }
}

export class RepositoryTransactionError extends RepositoryError {
  constructor(entityType: string, transactionId: string, reason: string) {
    super(`Repository ${entityType}: transaction ${transactionId} failed: ${reason}`);
    this.name = 'RepositoryTransactionError';
  }
}

export class RepositoryConfigurationError extends RepositoryError {
  constructor(reason: string) {
    super(`Repository configuration error: ${reason}`);
    this.name = 'RepositoryConfigurationError';
  }
}
