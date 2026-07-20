export class StorageProviderError extends Error {
  constructor(message: string) {
    super(`StorageProvider: ${message}`);
    this.name = 'StorageProviderError';
  }
}

export class ConnectionError extends StorageProviderError {
  constructor(message: string) {
    super(`Connection failed: ${message}`);
    this.name = 'StorageConnectionError';
  }
}

export class BucketError extends StorageProviderError {
  constructor(message: string) {
    super(`Bucket operation failed: ${message}`);
    this.name = 'StorageBucketError';
  }
}

export class BucketNotFoundError extends BucketError {
  constructor(bucket: string) {
    super(`Bucket not found: ${bucket}`);
    this.name = 'StorageBucketNotFoundError';
  }
}

export class BucketAlreadyExistsError extends BucketError {
  constructor(bucket: string) {
    super(`Bucket already exists: ${bucket}`);
    this.name = 'StorageBucketAlreadyExistsError';
  }
}

export class ObjectError extends StorageProviderError {
  constructor(message: string) {
    super(`Object operation failed: ${message}`);
    this.name = 'StorageObjectError';
  }
}

export class ObjectNotFoundError extends ObjectError {
  constructor(bucket: string, key: string) {
    super(`Object not found: ${bucket}/${key}`);
    this.name = 'StorageObjectNotFoundError';
  }
}

export class MultipartUploadError extends StorageProviderError {
  constructor(message: string) {
    super(`Multipart upload failed: ${message}`);
    this.name = 'StorageMultipartUploadError';
  }
}

export class SignedUrlError extends StorageProviderError {
  constructor(message: string) {
    super(`Signed URL generation failed: ${message}`);
    this.name = 'StorageSignedUrlError';
  }
}

export class MetadataError extends StorageProviderError {
  constructor(message: string) {
    super(`Metadata operation failed: ${message}`);
    this.name = 'StorageMetadataError';
  }
}

export class LifecycleError extends StorageProviderError {
  constructor(message: string) {
    super(`Lifecycle operation failed: ${message}`);
    this.name = 'StorageLifecycleError';
  }
}

export class ReplicationError extends StorageProviderError {
  constructor(message: string) {
    super(`Replication operation failed: ${message}`);
    this.name = 'StorageReplicationError';
  }
}

export class VersionError extends StorageProviderError {
  constructor(message: string) {
    super(`Version operation failed: ${message}`);
    this.name = 'StorageVersionError';
  }
}

export class ConfigurationError extends StorageProviderError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'StorageConfigurationError';
  }
}

export class ProviderNotFoundError extends StorageProviderError {
  constructor(name: string) {
    super(`Provider not found: ${name}`);
    this.name = 'StorageProviderNotFoundError';
  }
}

export class ChecksumMismatchError extends StorageProviderError {
  constructor(expected: string, actual: string) {
    super(`Checksum mismatch: expected ${expected}, got ${actual}`);
    this.name = 'StorageChecksumMismatchError';
  }
}
