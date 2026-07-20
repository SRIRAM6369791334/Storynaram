export class RedisProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RedisProviderError';
  }
}

export class ConnectionError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis connection failed: ${message}`);
    this.name = 'ConnectionError';
  }
}

export class QueryError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis query failed: ${message}`);
    this.name = 'QueryError';
  }
}

export class LockError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis lock error: ${message}`);
    this.name = 'LockError';
  }
}

export class LockNotAcquiredError extends LockError {
  constructor(resource: string) {
    super(`Could not acquire lock for resource: ${resource}`);
    this.name = 'LockNotAcquiredError';
  }
}

export class PubSubError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis pub/sub error: ${message}`);
    this.name = 'PubSubError';
  }
}

export class StreamError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis stream error: ${message}`);
    this.name = 'StreamError';
  }
}

export class QueueError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis queue error: ${message}`);
    this.name = 'QueueError';
  }
}

export class RateLimitError extends RedisProviderError {
  constructor(message: string) {
    super(`Rate limit error: ${message}`);
    this.name = 'RateLimitError';
  }
}

export class SessionError extends RedisProviderError {
  constructor(message: string) {
    super(`Redis session error: ${message}`);
    this.name = 'SessionError';
  }
}
