import { EntityRuntimeError } from '../errors';

export class AIRuntimeError extends EntityRuntimeError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'AIRuntimeError';
  }
}

export class AIProviderError extends AIRuntimeError {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
  ) {
    super(message, 'PROVIDER_ERROR');
    this.name = 'AIProviderError';
  }
}

export class AIModelError extends AIRuntimeError {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly model: string,
  ) {
    super(message, 'MODEL_ERROR');
    this.name = 'AIModelError';
  }
}

export class AITimeoutError extends AIRuntimeError {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly model: string,
    public readonly timeoutMs: number,
  ) {
    super(message, 'TIMEOUT');
    this.name = 'AITimeoutError';
  }
}

export class AIValidationError extends AIRuntimeError {
  constructor(
    message: string,
    public readonly issues: string[] = [],
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'AIValidationError';
  }
}

export class AIToolError extends AIRuntimeError {
  constructor(
    message: string,
    public readonly toolName: string,
  ) {
    super(message, 'TOOL_ERROR');
    this.name = 'AIToolError';
  }
}

export class AIRateLimitError extends AIRuntimeError {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message, 'RATE_LIMIT');
    this.name = 'AIRateLimitError';
  }
}

export class AIFallbackExhaustedError extends AIRuntimeError {
  constructor(
    public readonly attemptedProviders: string[],
    public readonly attemptedModels: string[],
  ) {
    super('All fallback providers and models exhausted', 'FALLBACK_EXHAUSTED');
    this.name = 'AIFallbackExhaustedError';
  }
}
