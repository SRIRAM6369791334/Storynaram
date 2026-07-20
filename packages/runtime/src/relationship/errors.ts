import { EntityRuntimeError } from '../errors';

export class RelationshipError extends EntityRuntimeError {
  constructor(message: string) {
    super(message);
    this.name = 'RelationshipError';
  }
}

export class RelationshipNotFoundError extends RelationshipError {
  constructor(edgeId: string) {
    super(`Relationship ${edgeId} not found`);
    this.name = 'RelationshipNotFoundError';
  }
}

export class RelationshipConflictError extends RelationshipError {
  constructor(sourceId: string, targetId: string, message?: string) {
    const suffix = message ? `: ${message}` : '';
    super(`Relationship conflict between ${sourceId} and ${targetId}${suffix}`);
    this.name = 'RelationshipConflictError';
  }
}

export class GraphCycleError extends RelationshipError {
  constructor(sourceId: string, targetId: string) {
    super(`Adding edge from ${sourceId} to ${targetId} would create a cycle`);
    this.name = 'GraphCycleError';
  }
}

export class RelationshipValidationError extends RelationshipError {
  constructor(entityId: string, reason: string) {
    super(`Relationship validation failed for ${entityId}: ${reason}`);
    this.name = 'RelationshipValidationError';
  }
}

export class RelationshipConfigurationError extends RelationshipError {
  constructor(reason: string) {
    super(`Relationship configuration error: ${reason}`);
    this.name = 'RelationshipConfigurationError';
  }
}
