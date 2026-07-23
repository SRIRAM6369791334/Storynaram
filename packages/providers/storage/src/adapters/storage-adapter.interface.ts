import type {
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
  SignedUrlOptions,
  SignedUrlOperation,
  LifecycleRule,
  ReplicationConfiguration,
  HealthCheckResult,
  StorageCapacityInfo,
} from '../types.js';

export interface IStorageAdapter {
  readonly providerName: string;
  readonly providerType: string;

  connect(): Promise<void>;
  close(): Promise<void>;
  ping(): Promise<boolean>;

  createBucket(bucket: string, options?: BucketOptions): Promise<void>;
  deleteBucket(bucket: string): Promise<void>;
  listBuckets(): Promise<string[]>;
  bucketExists(bucket: string): Promise<boolean>;

  upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult>;
  download(bucket: string, key: string, options?: DownloadOptions): Promise<DownloadResult>;
  delete(bucket: string, key: string): Promise<void>;
  copy(source: CopySource, destination: CopyDestination): Promise<void>;
  move(source: CopySource, destination: CopyDestination): Promise<void>;
  rename(bucket: string, oldKey: string, newKey: string): Promise<void>;
  list(bucket: string, options?: ListOptions): Promise<ListResult>;
  exists(bucket: string, key: string): Promise<boolean>;

  getMetadata(bucket: string, key: string): Promise<ObjectMetadata>;
  setMetadata(bucket: string, key: string, metadata: Record<string, string>): Promise<void>;
  getTags(bucket: string, key: string): Promise<Record<string, string>>;
  setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void>;

  createMultipartUpload(bucket: string, key: string, options?: MultipartUploadOptions): Promise<string>;
  uploadPart(bucket: string, key: string, uploadId: string, partNumber: number, data: Buffer): Promise<PartETag>;
  completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: PartETag[]): Promise<void>;
  abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<void>;

  getSignedUrl(operation: SignedUrlOperation, bucket: string, key: string, options?: SignedUrlOptions): Promise<string>;

  setLifecycleRules(bucket: string, rules: LifecycleRule[]): Promise<void>;
  getLifecycleRules(bucket: string): Promise<LifecycleRule[]>;
  setReplication(bucket: string, config: ReplicationConfiguration): Promise<void>;
  getReplication(bucket: string): Promise<ReplicationConfiguration>;
  setVersioning(bucket: string, enabled: boolean): Promise<void>;
  getVersioningStatus(bucket: string): Promise<boolean>;

  listVersions(bucket: string, key: string): Promise<ObjectVersion[]>;
  deleteVersion(bucket: string, key: string, versionId: string): Promise<void>;

  getCapacity?(): Promise<StorageCapacityInfo>;
}
