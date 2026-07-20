export class SearchError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SearchError';
  }
}

export class IndexNotFoundError extends SearchError {
  constructor(index: string) {
    super(`Index not found: ${index}`);
    this.name = 'IndexNotFoundError';
  }
}

export class IndexAlreadyExistsError extends SearchError {
  constructor(index: string) {
    super(`Index already exists: ${index}`);
    this.name = 'IndexAlreadyExistsError';
  }
}

export class DocumentNotFoundError extends SearchError {
  constructor(index: string, id: string) {
    super(`Document not found: ${index}/${id}`);
    this.name = 'DocumentNotFoundError';
  }
}

export class BulkOperationError extends SearchError {
  constructor(public readonly errors: Array<{ index: string; id: string; reason: string }>) {
    super(`Bulk operation failed with ${errors.length} errors`);
    this.name = 'BulkOperationError';
  }
}

export class SearchTimeoutError extends SearchError {
  constructor(query: string) {
    super(`Search query timed out: ${query}`);
    this.name = 'SearchTimeoutError';
  }
}

export class InvalidQueryError extends SearchError {
  constructor(reason: string) {
    super(`Invalid search query: ${reason}`);
    this.name = 'InvalidQueryError';
  }
}

export class ClusterUnavailableError extends SearchError {
  constructor(reason?: string) {
    super(`Search cluster unavailable${reason ? `: ${reason}` : ''}`);
    this.name = 'ClusterUnavailableError';
  }
}

export class ProviderNotFoundError extends SearchError {
  constructor(name: string) {
    super(`Search provider not found: ${name}`);
    this.name = 'ProviderNotFoundError';
  }
}

export class ReindexError extends SearchError {
  constructor(public readonly failedDocs: number) {
    super(`Reindex failed for ${failedDocs} documents`);
    this.name = 'ReindexError';
  }
}

export class TemplateNotFoundError extends SearchError {
  constructor(name: string) {
    super(`Index template not found: ${name}`);
    this.name = 'TemplateNotFoundError';
  }
}
