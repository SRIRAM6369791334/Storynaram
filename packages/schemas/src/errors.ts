export class SchemaRegistryError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SchemaRegistryError';
  }
}

export class SchemaNotFoundError extends SchemaRegistryError {
  constructor(schemaId: string) {
    super(`Schema not found: ${schemaId}`, 'SCHEMA_NOT_FOUND');
    this.name = 'SchemaNotFoundError';
  }
}

export class DuplicateSchemaError extends SchemaRegistryError {
  constructor(schemaId: string) {
    super(`Duplicate schema: ${schemaId}`, 'DUPLICATE_SCHEMA');
    this.name = 'DuplicateSchemaError';
  }
}

export class InvalidSchemaError extends SchemaRegistryError {
  constructor(schemaId: string, reason: string) {
    super(`Invalid schema ${schemaId}: ${reason}`, 'INVALID_SCHEMA');
    this.name = 'InvalidSchemaError';
  }
}

export class ReferenceResolutionError extends SchemaRegistryError {
  constructor(refPath: string, fromSchema: string) {
    super(`Cannot resolve reference "${refPath}" from schema "${fromSchema}"`, 'REFERENCE_RESOLUTION_ERROR');
    this.name = 'ReferenceResolutionError';
  }
}

export class CompilationError extends SchemaRegistryError {
  constructor(schemaId: string, ajvErrors: string[]) {
    super(`Compilation failed for schema "${schemaId}": ${ajvErrors.join('; ')}`, 'COMPILATION_ERROR');
    this.name = 'CompilationError';
  }
}

export class CircularDependencyError extends SchemaRegistryError {
  constructor(cycle: string[]) {
    super(`Circular dependency detected: ${cycle.join(' -> ')}`, 'CIRCULAR_DEPENDENCY');
    this.name = 'CircularDependencyError';
  }
}
