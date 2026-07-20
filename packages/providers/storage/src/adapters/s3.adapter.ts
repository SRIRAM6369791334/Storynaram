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
  DeleteObjectTaggingCommand,
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
import {
  ConnectionError,
  ObjectNotFoundError,
  BucketNotFoundError,
} from '../errors';

@Injectable()
export class S3Adapter implements IStorageAdapter {
  readonly providerType = 's3';
  private readonly logger = new Logger(S3Adapter.name);
  private client: S3Client;
  private _connected = false;

  constructor(
    readonly providerName: string,
    private readonly options: {
      endpoint?: string;
      region?: string;
      credentials?: { accessKeyId: string; secretAccessKey: string; sessionToken?: string };
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
        tls: this.options.tls?.enabled ?? true,
        forcePathStyle: this.options.forcePathStyle ?? false,
        requestHandler: {
          requestTimeout: 30_000,
        },
      });
      await this.ping();
      this._connected = true;
      this.logger.log(`S3 provider ${this.providerName} connected`);
    } catch (err) {
      throw new ConnectionError(`Failed to connect S3: ${(err as Error).message}`);
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
    try {
      await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
      if (options?.versioning) {
        await this.setVersioning(bucket, true);
      }
    } catch (err) {
      throw new ConnectionError(`Failed to create bucket ${bucket}: ${(err as Error).message}`);
    }
  }

  async deleteBucket(bucket: string): Promise<void> {
    try {
      await this.client.send(new DeleteBucketCommand({ Bucket: bucket }));
    } catch (err) {
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
    } catch {
      return false;
    }
  }

  async upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: options?.contentType,
      ContentDisposition: options?.contentDisposition,
      CacheControl: options?.cacheControl,
      Metadata: options?.metadata,
      Tagging: options?.tags ? Object.entries(options.tags).map(([k, v]) => `${k}=${v}`).join('&') : undefined,
    });
    const result = await this.client.send(command);
    return {
      bucket,
      key,
      etag: result.ETag ?? '',
      versionId: result.VersionId,
      size: data.length,
      contentType: options?.contentType ?? 'application/octet-stream',
      checksum: result.ChecksumSHA256,
    };
  }

  async download(bucket: string, key: string, options?: DownloadOptions): Promise<DownloadResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        IfMatch: options?.ifMatch,
        IfNoneMatch: options?.ifNoneMatch,
        IfModifiedSince: options?.ifModifiedSince,
        IfUnmodifiedSince: options?.ifUnmodifiedSince,
        Range: options?.range ? `bytes=${options.range.start}-${options.range.end}` : undefined,
      });
      const result = await this.client.send(command);
      const chunks: Buffer[] = [];
      for await (const chunk of result.Body! as AsyncIterable<Uint8Array>) {
        chunks.push(Buffer.from(chunk));
      }
      return {
        bucket,
        key,
        data: Buffer.concat(chunks),
        contentType: result.ContentType ?? 'application/octet-stream',
        contentLength: result.ContentLength ?? 0,
        etag: result.ETag ?? '',
        metadata: result.Metadata as Record<string, string> | undefined,
        lastModified: result.LastModified,
      };
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') {
        throw new ObjectNotFoundError(bucket, key);
      }
      throw err;
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') {
        throw new ObjectNotFoundError(bucket, key);
      }
      throw err;
    }
  }

  async copy(source: CopySource, destination: CopyDestination): Promise<void> {
    const sourcePath = source.versionId
      ? `${source.bucket}/${source.key}?versionId=${source.versionId}`
      : `${source.bucket}/${source.key}`;
    await this.client.send(new CopyObjectCommand({
      Bucket: destination.bucket,
      Key: destination.key,
      CopySource: sourcePath,
    }));
  }

  async move(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source.bucket, source.key);
  }

  async rename(bucket: string, oldKey: string, newKey: string): Promise<void> {
    await this.move({ bucket, key: oldKey }, { bucket, key: newKey });
  }

  async list(bucket: string, options?: ListOptions): Promise<ListResult> {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: options?.prefix,
      Delimiter: options?.delimiter,
      MaxKeys: options?.maxKeys,
      ContinuationToken: options?.continuationToken,
      StartAfter: options?.startAfter,
    });
    const result = await this.client.send(command);
    return {
      objects: (result.Contents ?? []).map(obj => ({
        key: obj.Key!,
        size: obj.Size ?? 0,
        etag: obj.ETag ?? '',
        lastModified: obj.LastModified ?? new Date(),
        storageClass: obj.StorageClass,
      })),
      prefixes: (result.CommonPrefixes ?? []).map(p => p.Prefix!),
      nextContinuationToken: result.NextContinuationToken,
      isTruncated: result.IsTruncated ?? false,
    };
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    const result = await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return {
      bucket,
      key,
      size: result.ContentLength ?? 0,
      etag: result.ETag ?? '',
      contentType: result.ContentType ?? 'application/octet-stream',
      contentDisposition: result.ContentDisposition,
      cacheControl: result.CacheControl,
      lastModified: result.LastModified ?? new Date(),
      metadata: (result.Metadata as Record<string, string>) ?? {},
      tags: {},
      versionId: result.VersionId,
      storageClass: result.StorageClass,
    };
  }

  async setMetadata(bucket: string, key: string, metadata: Record<string, string>): Promise<void> {
    const obj = await this.getMetadata(bucket, key);
    await this.upload(bucket, key, Buffer.alloc(0), {
      contentType: obj.contentType,
      metadata,
    });
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    try {
      const result = await this.client.send(new GetObjectTaggingCommand({ Bucket: bucket, Key: key }));
      const tags: Record<string, string> = {};
      for (const tag of result.TagSet ?? []) {
        if (tag.Key && tag.Value) tags[tag.Key] = tag.Value;
      }
      return tags;
    } catch {
      return {};
    }
  }

  async setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    const tagSet = Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
    await this.client.send(new PutObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
      Tagging: { TagSet: tagSet },
    }));
  }

  async createMultipartUpload(bucket: string, key: string, options?: MultipartUploadOptions): Promise<string> {
    const result = await this.client.send(new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: options?.contentType,
      Metadata: options?.metadata,
    }));
    return result.UploadId!;
  }

  async uploadPart(bucket: string, key: string, uploadId: string, partNumber: number, data: Buffer): Promise<PartETag> {
    const result = await this.client.send(new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: data,
    }));
    return { partNumber, etag: result.ETag! };
  }

  async completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: PartETag[]): Promise<void> {
    await this.client.send(new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(p => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
    }));
  }

  async abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<void> {
    await this.client.send(new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    }));
  }

  async getSignedUrl(operation: SignedUrlOperation, bucket: string, key: string, options?: SignedUrlOptions): Promise<string> {
    const expiresIn = options?.expiresInSeconds ?? 3600;
    let command: any;
    switch (operation) {
      case 'upload':
        command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: options?.contentType });
        break;
      case 'download':
        command = new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentDisposition: options?.contentDisposition });
        break;
      case 'delete':
        command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
        break;
    }
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async setLifecycleRules(bucket: string, rules: LifecycleRule[]): Promise<void> {
    await this.client.send(new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: {
        Rules: rules.map(r => ({
          ID: r.id,
          Status: r.enabled ? 'Enabled' : 'Disabled',
          Prefix: r.prefix,
          Expiration: r.expiration ? {
            Days: r.expiration.days,
            Date: r.expiration.date,
            ExpiredObjectDeleteMarker: r.expiration.deleteMarker,
          } : undefined,
          Transitions: r.transition ? [{
            Days: r.transition.days,
            StorageClass: r.transition.storageClass,
          }] : undefined,
          NoncurrentVersionExpiration: r.noncurrentVersionExpiration ? {
            NoncurrentDays: r.noncurrentVersionExpiration.noncurrentDays,
          } : undefined,
          NoncurrentVersionTransitions: r.noncurrentVersionTransition ? [{
            NoncurrentDays: r.noncurrentVersionTransition.noncurrentDays,
            StorageClass: r.noncurrentVersionTransition.storageClass,
          }] : undefined,
          AbortIncompleteMultipartUpload: r.abortIncompleteMultipartUpload ? {
            DaysAfterInitiation: r.abortIncompleteMultipartUpload.daysAfterInitiation,
          } : undefined,
        })),
      },
    }));
  }

  async getLifecycleRules(bucket: string): Promise<LifecycleRule[]> {
    const result = await this.client.send(new GetBucketLifecycleConfigurationCommand({ Bucket: bucket }));
    return (result.Rules ?? []).map(r => ({
      id: r.ID!,
      enabled: r.Status === 'Enabled',
      prefix: r.Prefix,
      expiration: r.Expiration ? {
        days: r.Expiration.Days,
        date: r.Expiration.Date,
        deleteMarker: r.Expiration.ExpiredObjectDeleteMarker,
      } : undefined,
      transition: r.Transitions?.[0] ? {
        days: r.Transitions[0].Days,
        storageClass: r.Transitions[0].StorageClass!,
      } : undefined,
    }));
  }

  async setReplication(bucket: string, config: ReplicationConfiguration): Promise<void> {
    await this.client.send(new PutBucketReplicationCommand({
      Bucket: bucket,
      ReplicationConfiguration: {
        Role: config.role,
        Rules: config.rules.map(r => ({
          ID: r.id,
          Status: r.enabled ? 'Enabled' : 'Disabled',
          Prefix: r.prefix,
          Destination: {
            Bucket: r.destinationBucket,
            StorageClass: r.destinationRegion,
          },
          DeleteMarkerReplication: r.deleteMarkerReplication ? { Status: 'Enabled' } : { Status: 'Disabled' },
        })),
      },
    }));
  }

  async getReplication(bucket: string): Promise<ReplicationConfiguration> {
    const result = await this.client.send(new GetBucketReplicationCommand({ Bucket: bucket }));
    return {
      role: result.ReplicationConfiguration?.Role ?? '',
      rules: (result.ReplicationConfiguration?.Rules ?? []).map(r => ({
        id: r.ID!,
        enabled: r.Status === 'Enabled',
        prefix: r.Prefix,
        destinationBucket: r.Destination?.Bucket ?? '',
      })),
    };
  }

  async setVersioning(bucket: string, enabled: boolean): Promise<void> {
    await this.client.send(new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: {
        Status: enabled ? 'Enabled' : 'Suspended',
      },
    }));
  }

  async getVersioningStatus(bucket: string): Promise<boolean> {
    const result = await this.client.send(new GetBucketVersioningCommand({ Bucket: bucket }));
    return result.Status === 'Enabled';
  }

  async listVersions(bucket: string, key: string): Promise<ObjectVersion[]> {
    const result = await this.client.send(new ListObjectVersionsCommand({
      Bucket: bucket,
      Prefix: key,
    }));
    return (result.Versions ?? []).map(v => ({
      key: v.Key!,
      versionId: v.VersionId!,
      isLatest: v.IsLatest ?? false,
      lastModified: v.LastModified ?? new Date(),
      size: v.Size ?? 0,
      etag: v.ETag ?? '',
    }));
  }

  async deleteVersion(bucket: string, key: string, versionId: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId,
    }));
  }

  async getCapacity(): Promise<StorageCapacityInfo> {
    return { usedBytes: 0, totalBytes: 0, availableBytes: 0, usedPercent: 0 };
  }
}
