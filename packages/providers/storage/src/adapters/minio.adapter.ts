import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListBucketsCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutBucketLifecycleConfigurationCommand,
  GetBucketLifecycleConfigurationCommand,
  PutBucketVersioningCommand,
  GetBucketVersioningCommand,
  PutBucketReplicationCommand,
  GetBucketReplicationCommand,
  ListObjectVersionsCommand,
  PutObjectTaggingCommand,
  GetObjectTaggingCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStorageAdapter } from './storage-adapter.interface';
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
  StorageCapacityInfo,
} from '../types';
import { ConnectionError, ObjectNotFoundError, BucketNotFoundError } from '../errors';

@Injectable()
export class MinIOAdapter implements IStorageAdapter {
  readonly providerType = 'minio';
  private readonly logger = new Logger(MinIOAdapter.name);
  private client!: S3Client;
  private _connected = false;

  constructor(
    readonly providerName: string,
    private readonly options: {
      endpoint: string;
      region?: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
      tls?: { enabled: boolean };
      forcePathStyle?: boolean;
    },
  ) {}

  async connect(): Promise<void> {
    try {
      this.client = new S3Client({
        endpoint: this.options.endpoint,
        region: this.options.region ?? 'us-east-1',
        credentials: this.options.credentials,
        tls: this.options.tls?.enabled ?? false,
        forcePathStyle: this.options.forcePathStyle ?? true,
        requestHandler: { requestTimeout: 30_000 },
      });
      await this.ping();
      this._connected = true;
      this.logger.log(`MinIO provider ${this.providerName} connected to ${this.options.endpoint}`);
    } catch (err) {
      throw new ConnectionError(`Failed to connect MinIO: ${(err as Error).message}`);
    }
  }

  async close(): Promise<void> {
    this.client?.destroy();
    this._connected = false;
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.send(new ListBucketsCommand({}));
      return true;
    } catch {
      return false;
    }
  }

  async createBucket(bucket: string, options?: BucketOptions): Promise<void> {
    await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
    if (options?.versioning) await this.setVersioning(bucket, true);
  }

  async deleteBucket(bucket: string): Promise<void> {
    try {
      await this.client.send(new DeleteBucketCommand({ Bucket: bucket }));
    } catch {
      throw new BucketNotFoundError(bucket);
    }
  }

  async listBuckets(): Promise<string[]> {
    const result = await this.client.send(new ListBucketsCommand({}));
    return (result.Buckets ?? []).map(b => b.Name!);
  }

  async bucketExists(bucket: string): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch { return false; }
  }

  async upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const result = await this.client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: data,
      ContentType: options?.contentType, Metadata: options?.metadata,
    }));
    return { bucket, key, etag: result.ETag ?? '', size: data.length, contentType: options?.contentType ?? 'application/octet-stream' };
  }

  async download(bucket: string, key: string, options?: DownloadOptions): Promise<DownloadResult> {
    try {
      const result = await this.client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const chunks: Buffer[] = [];
      for await (const chunk of result.Body! as AsyncIterable<Uint8Array>) chunks.push(Buffer.from(chunk));
      return { bucket, key, data: Buffer.concat(chunks), contentType: result.ContentType ?? 'application/octet-stream', contentLength: result.ContentLength ?? 0, etag: result.ETag ?? '' };
    } catch {
      throw new ObjectNotFoundError(bucket, key);
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    try { await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })); }
    catch { throw new ObjectNotFoundError(bucket, key); }
  }

  async copy(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.client.send(new CopyObjectCommand({ Bucket: destination.bucket, Key: destination.key, CopySource: `${source.bucket}/${source.key}` }));
  }

  async move(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source.bucket, source.key);
  }

  async rename(bucket: string, oldKey: string, newKey: string): Promise<void> {
    await this.move({ bucket, key: oldKey }, { bucket, key: newKey });
  }

  async list(bucket: string, options?: ListOptions): Promise<ListResult> {
    const result = await this.client.send(new ListObjectsV2Command({
      Bucket: bucket, Prefix: options?.prefix, Delimiter: options?.delimiter,
      MaxKeys: options?.maxKeys, ContinuationToken: options?.continuationToken,
    }));
    return {
      objects: (result.Contents ?? []).map(obj => ({ key: obj.Key!, size: obj.Size ?? 0, etag: obj.ETag ?? '', lastModified: obj.LastModified ?? new Date() })),
      prefixes: (result.CommonPrefixes ?? []).map(p => p.Prefix!),
      nextContinuationToken: result.NextContinuationToken, isTruncated: result.IsTruncated ?? false,
    };
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try { await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })); return true; }
    catch { return false; }
  }

  async getMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    const result = await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { bucket, key, size: result.ContentLength ?? 0, etag: result.ETag ?? '', contentType: result.ContentType ?? 'application/octet-stream', lastModified: result.LastModified ?? new Date(), metadata: (result.Metadata as Record<string, string>) ?? {}, tags: {}, storageClass: result.StorageClass };
  }

  async setMetadata(bucket: string, key: string, metadata: Record<string, string>): Promise<void> {
    const obj = await this.getMetadata(bucket, key);
    await this.upload(bucket, key, Buffer.alloc(0), { contentType: obj.contentType, metadata });
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    try {
      const result = await this.client.send(new GetObjectTaggingCommand({ Bucket: bucket, Key: key }));
      const tags: Record<string, string> = {};
      for (const tag of result.TagSet ?? []) if (tag.Key && tag.Value) tags[tag.Key] = tag.Value;
      return tags;
    } catch { return {}; }
  }

  async setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    await this.client.send(new PutObjectTaggingCommand({ Bucket: bucket, Key: key, Tagging: { TagSet: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })) } }));
  }

  async createMultipartUpload(bucket: string, key: string, options?: MultipartUploadOptions): Promise<string> {
    const result = await this.client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: options?.contentType }));
    return result.UploadId!;
  }

  async uploadPart(bucket: string, key: string, uploadId: string, partNumber: number, data: Buffer): Promise<PartETag> {
    const result = await this.client.send(new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber, Body: data }));
    return { partNumber, etag: result.ETag! };
  }

  async completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: PartETag[]): Promise<void> {
    await this.client.send(new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts.map(p => ({ PartNumber: p.partNumber, ETag: p.etag })) } }));
  }

  async abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<void> {
    await this.client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
  }

  async getSignedUrl(operation: SignedUrlOperation, bucket: string, key: string, options?: SignedUrlOptions): Promise<string> {
    const expiresIn = options?.expiresInSeconds ?? 3600;
    let command: any;
    switch (operation) {
      case 'upload': command = new PutObjectCommand({ Bucket: bucket, Key: key }); break;
      case 'download': command = new GetObjectCommand({ Bucket: bucket, Key: key }); break;
      case 'delete': command = new DeleteObjectCommand({ Bucket: bucket, Key: key }); break;
    }
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async setLifecycleRules(bucket: string, rules: LifecycleRule[]): Promise<void> {
    await this.client.send(new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: { Rules: rules.map(r => ({ ID: r.id, Status: r.enabled ? 'Enabled' : 'Disabled', Prefix: r.prefix })) },
    }));
  }

  async getLifecycleRules(bucket: string): Promise<LifecycleRule[]> {
    const result = await this.client.send(new GetBucketLifecycleConfigurationCommand({ Bucket: bucket }));
    return (result.Rules ?? []).map(r => ({ id: r.ID!, enabled: r.Status === 'Enabled', prefix: r.Prefix }));
  }

  async setReplication(_bucket: string, _config: ReplicationConfiguration): Promise<void> {
    throw new Error('Replication not supported by MinIO');
  }

  async getReplication(_bucket: string): Promise<ReplicationConfiguration> {
    throw new Error('Replication not supported by MinIO');
  }

  async setVersioning(bucket: string, enabled: boolean): Promise<void> {
    await this.client.send(new PutBucketVersioningCommand({ Bucket: bucket, VersioningConfiguration: { Status: enabled ? 'Enabled' : 'Suspended' } }));
  }

  async getVersioningStatus(bucket: string): Promise<boolean> {
    const result = await this.client.send(new GetBucketVersioningCommand({ Bucket: bucket }));
    return result.Status === 'Enabled';
  }

  async listVersions(bucket: string, key: string): Promise<ObjectVersion[]> {
    const result = await this.client.send(new ListObjectVersionsCommand({ Bucket: bucket, Prefix: key }));
    return (result.Versions ?? []).map(v => ({ key: v.Key!, versionId: v.VersionId!, isLatest: v.IsLatest ?? false, lastModified: v.LastModified ?? new Date(), size: v.Size ?? 0, etag: v.ETag ?? '' }));
  }

  async deleteVersion(bucket: string, key: string, versionId: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key, VersionId: versionId }));
  }

  async getCapacity(): Promise<StorageCapacityInfo> {
    return { usedBytes: 0, totalBytes: 0, availableBytes: 0, usedPercent: 0 };
  }
}
