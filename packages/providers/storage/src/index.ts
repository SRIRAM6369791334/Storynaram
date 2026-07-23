export { StorageModule } from './storage.module.js';
export { StorageClient } from './storage-client.js';
export { StorageRegistry } from './storage-registry.js';
export { BucketManager } from './bucket-manager.js';
export { ObjectManager } from './object-manager.js';
export { MultipartUploadManager } from './multipart-upload-manager.js';
export { SignedUrlService } from './signed-url-service.js';
export { MetadataService } from './metadata-service.js';
export { LifecycleManager } from './lifecycle-manager.js';
export { ReplicationManager } from './replication-manager.js';
export { VersionManager } from './version-manager.js';
export { StorageHealthIndicator } from './observability/health-indicator.js';
export { StorageMetricsCollector } from './observability/metrics-collector.js';
export { StorageStatisticsService } from './observability/statistics-service.js';
export { S3Adapter } from './adapters/s3.adapter.js';
export { MinIOAdapter } from './adapters/minio.adapter.js';
export { AzureBlobAdapter } from './adapters/azure-blob.adapter.js';
export { LocalFSAdapter } from './adapters/local-fs.adapter.js';
export { MemoryAdapter } from './adapters/memory.adapter.js';
export type { IStorageAdapter } from './adapters/storage-adapter.interface.js';

export {
  StorageProviderError,
  ConnectionError,
  BucketError,
  BucketNotFoundError,
  BucketAlreadyExistsError,
  ObjectError,
  ObjectNotFoundError,
  MultipartUploadError,
  SignedUrlError,
  MetadataError,
  LifecycleError,
  ReplicationError,
  VersionError,
  ConfigurationError,
  ProviderNotFoundError,
  ChecksumMismatchError,
} from './errors.js';

export {
  STORAGE_MODULE_OPTIONS,
  STORAGE_CLIENT,
  STORAGE_REGISTRY,
  STORAGE_BUCKET_MANAGER,
  STORAGE_OBJECT_MANAGER,
  STORAGE_MULTIPART_UPLOAD_MANAGER,
  STORAGE_SIGNED_URL_SERVICE,
  STORAGE_METADATA_SERVICE,
  STORAGE_LIFECYCLE_MANAGER,
  STORAGE_REPLICATION_MANAGER,
  STORAGE_VERSION_MANAGER,
  STORAGE_HEALTH_INDICATOR,
  STORAGE_METRICS_COLLECTOR,
  STORAGE_STATISTICS_SERVICE,
  getStorageClientToken,
  getStorageProviderConfigToken,
} from './tokens.js';

export type {
  StorageModuleOptions,
  StorageProviderConfig,
  StorageCredentials,
  StorageProviderType,
  BucketOptions,
  UploadOptions,
  DownloadOptions,
  UploadResult,
  DownloadResult,
  ObjectMetadata,
  ObjectVersion,
  ListResult,
  ListOptions,
  CopySource,
  CopyDestination,
  PartETag,
  MultipartUploadOptions,
  MultipartUploadInfo,
  SignedUrlOptions,
  SignedUrlOperation,
  LifecycleRule,
  LifecycleExpiration,
  LifecycleTransition,
  ReplicationConfiguration,
  ReplicationRule,
  HealthCheckResult,
  StorageCapacityInfo,
  ProviderStatistics,
  StorageMetrics,
  RetryOptions,
  TimeoutOptions,
  CompressionOptions,
  TLSOptions,
} from './types.js';
export type { StorageModuleAsyncOptions } from './tokens.js';
