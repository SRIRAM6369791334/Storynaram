export class ValidationEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationEngineError';
  }
}

export class ValidationProfileError extends ValidationEngineError {
  constructor(profileName: string, reason: string) {
    super(`Validation profile "${profileName}" error: ${reason}`);
    this.name = 'ValidationProfileError';
  }
}

export class ValidationExecutionError extends ValidationEngineError {
  constructor(schemaId: string, reason: string) {
    super(`Validation execution failed for ${schemaId}: ${reason}`);
    this.name = 'ValidationExecutionError';
  }
}

export class ValidationConfigurationError extends ValidationEngineError {
  constructor(reason: string) {
    super(`Validation configuration error: ${reason}`);
    this.name = 'ValidationConfigurationError';
  }
}
