export class EntityRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EntityRuntimeError';
  }
}

export class EntityNotFoundError extends EntityRuntimeError {
  constructor(entityType: string, entityId: string) {
    super(`Entity ${entityType} with id ${entityId} not found`);
    this.name = 'EntityNotFoundError';
  }
}

export class EntityValidationError extends EntityRuntimeError {
  constructor(entityType: string, errors: string[]) {
    super(`Entity ${entityType} validation failed: ${errors.join('; ')}`);
    this.name = 'EntityValidationError';
  }
}

export class EntityOperationError extends EntityRuntimeError {
  constructor(entityType: string, operation: string, reason: string) {
    super(`Entity ${entityType} ${operation} failed: ${reason}`);
    this.name = 'EntityOperationError';
  }
}
