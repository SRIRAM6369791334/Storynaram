import type { InjectionToken } from '@nestjs/common';

export type StorageProviderType = 's3' | 'minio' | 'azure-blob' | 'local-fs' | 'memory';

export interface StorageModuleOptions {
  defaultProvider?: string;
  providers: StorageProviderConfig[];
  enableMetrics?: boolean;
  defaultBucket?: string;
  compression?: CompressionOptions;
  retry?: RetryOptions;
  timeout?: TimeoutOptions;
}

export interface StorageProviderConfig {
  name: string;
  type: StorageProviderType;
  credentials?: StorageCredentials;
  endpoint?: string;
  region?: string;
  buckets?: string[];
  tls?: TLSOptions;
  defaultBucketOptions?: BucketOptions;
}

export interface StorageCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  connectionString?: string;
  accountName?: string;
  accountKey?: string;
}

export interface TLSOptions {
  enabled: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  rejectUnauthorized?: boolean;
}

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface TimeoutOptions {
  connectionMs: number;
  requestMs: number;
  uploadMs: number;
  downloadMs: number;
}

export interface CompressionOptions {
  enabled: boolean;
  algorithm: 'gzip' | 'deflate' | 'brotli';
  level: number;
  minSizeBytes: number;
}

export interface BucketOptions {
  versioning?: boolean;
  encryption?: boolean;
  publicAccess?: boolean;
  tags?: Record<string, string>;
}

export interface UploadOptions {
  contentType?: string;
  contentDisposition?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  compression?: boolean;
  checksum?: boolean;
}

export interface DownloadOptions {
  range?: { start: number; end: number };
  ifMatch?: string;
  ifNoneMatch?: string;
  ifModifiedSince?: Date;
  ifUnmodifiedSince?: Date;
}

export interface UploadResult {
  bucket: string;
  key: string;
  etag: string;
  versionId?: string;
  size: number;
  contentType: string;
  checksum?: string;
}

export interface DownloadResult {
  bucket: string;
  key: string;
  data: Buffer;
  contentType: string;
  contentLength: number;
  etag: string;
  metadata?: Record<string, string>;
  lastModified?: Date;
}

export interface ObjectMetadata {
  bucket: string;
  key: string;
  size: number;
  etag: string;
  contentType: string;
  contentDisposition?: string;
  cacheControl?: string;
  lastModified: Date;
  metadata: Record<string, string>;
  tags: Record<string, string>;
  versionId?: string;
  storageClass?: string;
}

export interface ObjectVersion {
  key: string;
  versionId: string;
  isLatest: boolean;
  lastModified: Date;
  size: number;
  etag: string;
}

export interface ListResult {
  objects: ObjectSummary[];
  prefixes: string[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}

export interface ObjectSummary {
  key: string;
  size: number;
  etag: string;
  lastModified: Date;
  storageClass?: string;
}

export interface ListOptions {
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  continuationToken?: string;
  startAfter?: string;
  recursive?: boolean;
}

export interface CopySource {
  bucket: string;
  key: string;
  versionId?: string;
}

export interface CopyDestination {
  bucket: string;
  key: string;
}

export interface PartETag {
  partNumber: number;
  etag: string;
}

export interface MultipartUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  partSize?: number;
}

export interface MultipartUploadInfo {
  uploadId: string;
  bucket: string;
  key: string;
  initiated: Date;
}

export interface SignedUrlOptions {
  expiresInSeconds?: number;
  permissions?: ('read' | 'write' | 'delete')[];
  contentType?: string;
  contentDisposition?: string;
}

export type SignedUrlOperation = 'upload' | 'download' | 'delete';

export interface LifecycleRule {
  id: string;
  enabled: boolean;
  prefix?: string;
  tags?: Record<string, string>;
  expiration?: LifecycleExpiration;
  transition?: LifecycleTransition;
  noncurrentVersionExpiration?: LifecycleNoncurrentVersionExpiration;
  noncurrentVersionTransition?: LifecycleNoncurrentVersionTransition;
  abortIncompleteMultipartUpload?: LifecycleAbortIncompleteMultipartUpload;
}

export interface LifecycleExpiration {
  days?: number;
  date?: Date;
  deleteMarker?: boolean;
}

export interface LifecycleTransition {
  days?: number;
  storageClass: string;
}

export interface LifecycleNoncurrentVersionExpiration {
  noncurrentDays: number;
}

export interface LifecycleNoncurrentVersionTransition {
  noncurrentDays: number;
  storageClass: string;
}

export interface LifecycleAbortIncompleteMultipartUpload {
  daysAfterInitiation: number;
}

export interface ReplicationRule {
  id: string;
  enabled: boolean;
  prefix?: string;
  destinationBucket: string;
  destinationRegion?: string;
  destinationAccount?: string;
  metrics?: boolean;
  deleteMarkerReplication?: boolean;
  encryptionConfiguration?: ReplicationEncryptionConfiguration;
}

export interface ReplicationEncryptionConfiguration {
  replicaKmsKeyId: string;
}

export interface ReplicationConfiguration {
  role: string;
  rules: ReplicationRule[];
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: string;
  latency: number;
  buckets: { name: string; accessible: boolean }[];
  storageCapacity?: StorageCapacityInfo;
  error?: string;
  timestamp: Date;
}

export interface StorageCapacityInfo {
  usedBytes: number;
  totalBytes: number;
  availableBytes: number;
  usedPercent: number;
}

export interface ProviderStatistics {
  totalUploads: number;
  totalDownloads: number;
  totalDeletes: number;
  totalBytesUploaded: number;
  totalBytesDownloaded: number;
  activeMultipartUploads: number;
  totalBuckets: number;
  totalObjects: number;
  uploadSpeedAvg: number;
  downloadSpeedAvg: number;
  failureCount: number;
  latencyAvg: number;
  latencyP95: number;
  latencyP99: number;
}

export interface StorageMetrics {
  uploadCount: number;
  downloadCount: number;
  deleteCount: number;
  listCount: number;
  multipartUploadCount: number;
  signedUrlCount: number;
  errors: number;
  bytesUploaded: number;
  bytesDownloaded: number;
  operationLatencies: Record<string, number[]>;
}
