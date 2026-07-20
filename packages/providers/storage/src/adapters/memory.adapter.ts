import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
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
  ObjectNotFoundError,
  BucketNotFoundError,
  BucketAlreadyExistsError,
} from '../errors';

interface MemoryObject {
  data: Buffer;
  etag: string;
  contentType: string;
  contentDisposition?: string;
  cacheControl?: string;
  metadata: Record<string, string>;
  tags: Record<string, string>;
  createdAt: Date;
  lastModified: Date;
}

interface MemoryBucket {
  name: string;
  objects: Map<string, MemoryObject>;
  versions: Map<string, MemoryObject[]>;
  versioning: boolean;
  createdAt: Date;
}

interface MemoryMultipartUpload {
  uploadId: string;
  bucket: string;
  key: string;
  parts: Map<number, Buffer>;
  metadata: Record<string, string>;
  createdAt: Date;
}

@Injectable()
export class MemoryAdapter implements IStorageAdapter {
  readonly providerType = 'memory';
  private readonly logger = new Logger(MemoryAdapter.name);
  private readonly buckets = new Map<string, MemoryBucket>();
  private readonly multipartUploads = new Map<string, MemoryMultipartUpload>();
  private _connected = false;

  constructor(readonly providerName: string) {}

  async connect(): Promise<void> {
    this._connected = true;
    this.logger.log(`Memory provider ${this.providerName} ready`);
  }

  async close(): Promise<void> {
    this.buckets.clear();
    this.multipartUploads.clear();
    this._connected = false;
  }

  async ping(): Promise<boolean> {
    return this._connected;
  }

  private getBucket(name: string): MemoryBucket {
    const bucket = this.buckets.get(name);
    if (!bucket) throw new BucketNotFoundError(name);
    return bucket;
  }

  private getObject(bucket: string, key: string): MemoryObject {
    const b = this.getBucket(bucket);
    const obj = b.objects.get(key);
    if (!obj) throw new ObjectNotFoundError(bucket, key);
    return obj;
  }

  async createBucket(bucket: string, options?: BucketOptions): Promise<void> {
    if (this.buckets.has(bucket)) throw new BucketAlreadyExistsError(bucket);
    this.buckets.set(bucket, {
      name: bucket,
      objects: new Map(),
      versions: new Map(),
      versioning: options?.versioning ?? false,
      createdAt: new Date(),
    });
  }

  async deleteBucket(bucket: string): Promise<void> {
    if (!this.buckets.has(bucket)) throw new BucketNotFoundError(bucket);
    this.buckets.delete(bucket);
  }

  async listBuckets(): Promise<string[]> {
    return Array.from(this.buckets.keys());
  }

  async bucketExists(bucket: string): Promise<boolean> {
    return this.buckets.has(bucket);
  }

  async upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const b = this.getBucket(bucket);
    const etag = crypto.createHash('md5').update(data).digest('hex');
    const now = new Date();
    const obj: MemoryObject = {
      data,
      etag: `"${etag}"`,
      contentType: options?.contentType ?? 'application/octet-stream',
      contentDisposition: options?.contentDisposition,
      cacheControl: options?.cacheControl,
      metadata: options?.metadata ?? {},
      tags: options?.tags ?? {},
      createdAt: now,
      lastModified: now,
    };
    if (b.versioning) {
      const versions = b.versions.get(key) ?? [];
      const existing = b.objects.get(key);
      if (existing) {
        versions.push({ ...existing });
      }
      b.versions.set(key, versions);
    }
    b.objects.set(key, obj);
    return {
      bucket,
      key,
      etag: obj.etag,
      size: data.length,
      contentType: obj.contentType,
      checksum: etag,
    };
  }

  async download(bucket: string, key: string, _options?: DownloadOptions): Promise<DownloadResult> {
    const obj = this.getObject(bucket, key);
    return {
      bucket,
      key,
      data: obj.data,
      contentType: obj.contentType,
      contentLength: obj.data.length,
      etag: obj.etag,
      metadata: obj.metadata,
      lastModified: obj.lastModified,
    };
  }

  async delete(bucket: string, key: string): Promise<void> {
    const b = this.getBucket(bucket);
    if (!b.objects.has(key)) throw new ObjectNotFoundError(bucket, key);
    b.objects.delete(key);
  }

  async copy(source: CopySource, destination: CopyDestination): Promise<void> {
    const obj = this.getObject(source.bucket, source.key);
    const b = this.getBucket(destination.bucket);
    b.objects.set(destination.key, { ...obj, lastModified: new Date() });
  }

  async move(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source.bucket, source.key);
  }

  async rename(bucket: string, oldKey: string, newKey: string): Promise<void> {
    await this.move({ bucket, key: oldKey }, { bucket, key: newKey });
  }

  async list(bucket: string, options?: ListOptions): Promise<ListResult> {
    const b = this.getBucket(bucket);
    const prefix = options?.prefix ?? '';
    const delimiter = options?.delimiter;
    const maxKeys = options?.maxKeys ?? 1000;
    const objects: ListResult['objects'] = [];
    const prefixes = new Set<string>();
    let count = 0;

    for (const [key, obj] of b.objects) {
      if (count >= maxKeys) break;
      if (!key.startsWith(prefix)) continue;
      if (delimiter) {
        const rest = key.substring(prefix.length);
        const idx = rest.indexOf(delimiter);
        if (idx >= 0) {
          prefixes.add(prefix + rest.substring(0, idx + delimiter.length));
          continue;
        }
      }
      objects.push({
        key,
        size: obj.data.length,
        etag: obj.etag,
        lastModified: obj.lastModified,
      });
      count++;
    }
    return { objects, prefixes: Array.from(prefixes), isTruncated: count >= maxKeys };
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try {
      this.getObject(bucket, key);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    const obj = this.getObject(bucket, key);
    return {
      bucket,
      key,
      size: obj.data.length,
      etag: obj.etag,
      contentType: obj.contentType,
      contentDisposition: obj.contentDisposition,
      cacheControl: obj.cacheControl,
      lastModified: obj.lastModified,
      metadata: obj.metadata,
      tags: obj.tags,
    };
  }

  async setMetadata(bucket: string, key: string, metadata: Record<string, string>): Promise<void> {
    const obj = this.getObject(bucket, key);
    obj.metadata = metadata;
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    const obj = this.getObject(bucket, key);
    return obj.tags;
  }

  async setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    const obj = this.getObject(bucket, key);
    obj.tags = tags;
  }

  async createMultipartUpload(bucket: string, key: string, options?: MultipartUploadOptions): Promise<string> {
    this.getBucket(bucket);
    const uploadId = crypto.randomUUID();
    this.multipartUploads.set(uploadId, {
      uploadId,
      bucket,
      key,
      parts: new Map(),
      metadata: options?.metadata ?? {},
      createdAt: new Date(),
    });
    return uploadId;
  }

  async uploadPart(_bucket: string, _key: string, uploadId: string, partNumber: number, data: Buffer): Promise<PartETag> {
    const upload = this.multipartUploads.get(uploadId);
    if (!upload) throw new Error(`Upload ${uploadId} not found`);
    const etag = crypto.createHash('md5').update(data).digest('hex');
    upload.parts.set(partNumber, data);
    return { partNumber, etag };
  }

  async completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: PartETag[]): Promise<void> {
    const upload = this.multipartUploads.get(uploadId);
    if (!upload) throw new Error(`Upload ${uploadId} not found`);
    const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    const chunks: Buffer[] = [];
    for (const part of sorted) {
      const data = upload.parts.get(part.partNumber);
      if (data) chunks.push(data);
    }
    const complete = Buffer.concat(chunks);
    await this.upload(bucket, key, complete, { metadata: upload.metadata });
    this.multipartUploads.delete(uploadId);
  }

  async abortMultipartUpload(_bucket: string, _key: string, uploadId: string): Promise<void> {
    this.multipartUploads.delete(uploadId);
  }

  async getSignedUrl(_operation: SignedUrlOperation, _bucket: string, _key: string, _options?: SignedUrlOptions): Promise<string> {
    throw new Error('Signed URLs not supported by Memory adapter');
  }

  async setLifecycleRules(_bucket: string, _rules: LifecycleRule[]): Promise<void> {
    // no-op for memory
  }

  async getLifecycleRules(_bucket: string): Promise<LifecycleRule[]> {
    return [];
  }

  async setReplication(_bucket: string, _config: ReplicationConfiguration): Promise<void> {
    throw new Error('Replication not supported by Memory adapter');
  }

  async getReplication(_bucket: string): Promise<ReplicationConfiguration> {
    throw new Error('Replication not supported by Memory adapter');
  }

  async setVersioning(bucket: string, enabled: boolean): Promise<void> {
    const b = this.getBucket(bucket);
    b.versioning = enabled;
  }

  async getVersioningStatus(bucket: string): Promise<boolean> {
    const b = this.getBucket(bucket);
    return b.versioning;
  }

  async listVersions(bucket: string, key: string): Promise<ObjectVersion[]> {
    const b = this.getBucket(bucket);
    const current = b.objects.get(key);
    const versions = b.versions.get(key) ?? [];
    const result: ObjectVersion[] = versions.map((v, i) => ({
      key,
      versionId: `v${i}`,
      isLatest: false,
      lastModified: v.lastModified,
      size: v.data.length,
      etag: v.etag,
    }));
    if (current) {
      result.push({
        key,
        versionId: 'current',
        isLatest: true,
        lastModified: current.lastModified,
        size: current.data.length,
        etag: current.etag,
      });
    }
    return result;
  }

  async deleteVersion(bucket: string, key: string, versionId: string): Promise<void> {
    const b = this.getBucket(bucket);
    if (versionId === 'current') {
      b.objects.delete(key);
    } else {
      const versions = b.versions.get(key) ?? [];
      const idx = parseInt(versionId.replace('v', ''), 10);
      if (!isNaN(idx) && idx >= 0 && idx < versions.length) {
        versions.splice(idx, 1);
        if (versions.length === 0) b.versions.delete(key);
      }
    }
  }

  async getCapacity(): Promise<StorageCapacityInfo> {
    let usedBytes = 0;
    for (const b of this.buckets.values()) {
      for (const obj of b.objects.values()) {
        usedBytes += obj.data.length;
      }
    }
    return {
      usedBytes,
      totalBytes: Number.MAX_SAFE_INTEGER,
      availableBytes: Number.MAX_SAFE_INTEGER - usedBytes,
      usedPercent: 0,
    };
  }
}
