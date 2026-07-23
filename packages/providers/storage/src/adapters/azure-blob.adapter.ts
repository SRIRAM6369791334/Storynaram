import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  BlobClient,
  BlockBlobClient,
} from '@azure/storage-blob';
import type { IStorageAdapter } from './storage-adapter.interface.js';
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
} from '../types.js';
import {
  ConnectionError,
  ObjectNotFoundError,
  BucketNotFoundError,
} from '../errors.js';

@Injectable()
export class AzureBlobAdapter implements IStorageAdapter {
  readonly providerType = 'azure-blob';
  private readonly logger = new Logger(AzureBlobAdapter.name);
  private client!: BlobServiceClient;
  private _connected = false;

  constructor(
    readonly providerName: string,
    private readonly options: {
      connectionString?: string;
      accountName?: string;
      accountKey?: string;
    },
  ) {}

  async connect(): Promise<void> {
    try {
      if (this.options.connectionString) {
        this.client = BlobServiceClient.fromConnectionString(this.options.connectionString);
      } else if (this.options.accountName && this.options.accountKey) {
        const url = `https://${this.options.accountName}.blob.core.windows.net`;
        const { StorageSharedKeyCredential } = await import('@azure/storage-blob');
        const credential = new StorageSharedKeyCredential(this.options.accountName, this.options.accountKey);
        this.client = new BlobServiceClient(url, credential);
      } else {
        throw new ConnectionError('Azure Blob requires connectionString or accountName+accountKey');
      }
      await this.ping();
      this._connected = true;
      this.logger.log(`Azure Blob provider ${this.providerName} connected`);
    } catch (err) {
      throw new ConnectionError(`Failed to connect Azure Blob: ${(err as Error).message}`);
    }
  }

  async close(): Promise<void> {
    this._connected = false;
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.getAccountInfo();
      return true;
    } catch {
      return false;
    }
  }

  private getContainerClient(bucket: string): ContainerClient {
    return this.client.getContainerClient(bucket);
  }

  private getBlobClient(bucket: string, key: string): BlobClient {
    return this.getContainerClient(bucket).getBlobClient(key);
  }

  private getBlockBlobClient(bucket: string, key: string): BlockBlobClient {
    return this.getContainerClient(bucket).getBlockBlobClient(key);
  }

  async createBucket(bucket: string, _options?: BucketOptions): Promise<void> {
    const container = this.getContainerClient(bucket);
    await container.create();
  }

  async deleteBucket(bucket: string): Promise<void> {
    const container = this.getContainerClient(bucket);
    try {
      await container.delete();
    } catch {
      throw new BucketNotFoundError(bucket);
    }
  }

  async listBuckets(): Promise<string[]> {
    const buckets: string[] = [];
    for await (const container of this.client.listContainers()) {
      buckets.push(container.name);
    }
    return buckets;
  }

  async bucketExists(bucket: string): Promise<boolean> {
    const container = this.getContainerClient(bucket);
    try {
      await container.getProperties();
      return true;
    } catch {
      return false;
    }
  }

  async upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const blockBlob = this.getBlockBlobClient(bucket, key);
    const metadata = options?.metadata;
    await blockBlob.upload(data, data.length, {
      blobHTTPHeaders: {
        blobContentType: options?.contentType,
        blobContentDisposition: options?.contentDisposition,
        blobCacheControl: options?.cacheControl,
      },
      metadata,
    });
    const props = await blockBlob.getProperties();
    return {
      bucket,
      key,
      etag: props.etag!,
      size: data.length,
      contentType: options?.contentType ?? 'application/octet-stream',
    };
  }

  async download(bucket: string, key: string, _options?: DownloadOptions): Promise<DownloadResult> {
    const blockBlob = this.getBlockBlobClient(bucket, key);
    try {
      const result = await blockBlob.downloadToBuffer();
      const props = await blockBlob.getProperties();
      return {
        bucket,
        key,
        data: result,
        contentType: props.contentType ?? 'application/octet-stream',
        contentLength: result.length,
        etag: props.etag!,
        metadata: props.metadata as Record<string, string>,
        lastModified: props.lastModified,
      };
    } catch {
      throw new ObjectNotFoundError(bucket, key);
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    const blockBlob = this.getBlockBlobClient(bucket, key);
    try {
      await blockBlob.delete();
    } catch {
      throw new ObjectNotFoundError(bucket, key);
    }
  }

  async copy(source: CopySource, destination: CopyDestination): Promise<void> {
    const sourceBlob = source.versionId
      ? this.getBlobClient(source.bucket, source.key).withVersion(source.versionId)
      : this.getBlobClient(source.bucket, source.key);
    const destBlob = this.getBlockBlobClient(destination.bucket, destination.key);
    const sourceUrl = sourceBlob.url;
    await destBlob.syncCopyFromURL(sourceUrl);
  }

  async move(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source.bucket, source.key);
  }

  async rename(bucket: string, oldKey: string, newKey: string): Promise<void> {
    await this.move({ bucket, key: oldKey }, { bucket, key: newKey });
  }

  async list(bucket: string, options?: ListOptions): Promise<ListResult> {
    const container = this.getContainerClient(bucket);
    const objects: ListResult['objects'] = [];
    const prefixes: string[] = [];
    const maxResults = options?.maxKeys ?? 5000;
    let count = 0;
    for await (const item of container.listBlobsByHierarchy(options?.delimiter ?? '/', { prefix: options?.prefix })) {
      if (count >= maxResults) break;
      if (item.kind === 'prefix') {
        prefixes.push(item.name);
      } else {
        objects.push({
          key: item.name,
          size: item.properties.contentLength ?? 0,
          etag: item.properties.etag ?? '',
          lastModified: item.properties.lastModified ?? new Date(),
        });
      }
      count++;
    }
    return { objects, prefixes, isTruncated: count >= maxResults };
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.getBlobClient(bucket, key).getProperties();
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    const props = await this.getBlobClient(bucket, key).getProperties();
    return {
      bucket,
      key,
      size: props.contentLength ?? 0,
      etag: props.etag!,
      contentType: props.contentType ?? 'application/octet-stream',
      contentDisposition: props.contentDisposition,
      cacheControl: props.cacheControl,
      lastModified: props.lastModified ?? new Date(),
      metadata: (props.metadata as Record<string, string>) ?? {},
      tags: {},
    };
  }

  async setMetadata(bucket: string, key: string, metadata: Record<string, string>): Promise<void> {
    await this.getBlobClient(bucket, key).setMetadata(metadata);
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    try {
      const result = await this.getBlobClient(bucket, key).getTags();
      return result.tags ?? {};
    } catch {
      return {};
    }
  }

  async setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    await this.getBlobClient(bucket, key).setTags(tags);
  }

  async createMultipartUpload(_bucket: string, _key: string, _options?: MultipartUploadOptions): Promise<string> {
    throw new Error('Azure Blob does not use multipart upload; use upload for large files');
  }

  async uploadPart(_bucket: string, _key: string, _uploadId: string, _partNumber: number, _data: Buffer): Promise<PartETag> {
    throw new Error('Azure Blob does not use multipart upload');
  }

  async completeMultipartUpload(_bucket: string, _key: string, _uploadId: string, _parts: PartETag[]): Promise<void> {
    throw new Error('Azure Blob does not use multipart upload');
  }

  async abortMultipartUpload(_bucket: string, _key: string, _uploadId: string): Promise<void> {
    throw new Error('Azure Blob does not use multipart upload');
  }

  async getSignedUrl(operation: SignedUrlOperation, bucket: string, key: string, options?: SignedUrlOptions): Promise<string> {
    const { ContainerSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } = await import('@azure/storage-blob');
    const container = this.getContainerClient(bucket);
    const blob = container.getBlobClient(key);
    const expiresOn = new Date(Date.now() + (options?.expiresInSeconds ?? 3600) * 1000);
    let permissions: any;
    switch (operation) {
      case 'upload':
      case 'delete':
        permissions = ContainerSASPermissions.parse('w');
        break;
      case 'download':
        permissions = ContainerSASPermissions.parse('r');
        break;
    }
    const sasToken = generateBlobSASQueryParameters({
      containerName: bucket,
      blobName: key,
      permissions,
      expiresOn,
    }, new StorageSharedKeyCredential(
      (this.client as any).accountName,
      this.options.accountKey!,
    )).toString();
    return `${blob.url}?${sasToken}`;
  }

  async setLifecycleRules(_bucket: string, _rules: LifecycleRule[]): Promise<void> {
    throw new Error('Lifecycle rules not supported via Azure Blob adapter');
  }

  async getLifecycleRules(_bucket: string): Promise<LifecycleRule[]> {
    throw new Error('Lifecycle rules not supported via Azure Blob adapter');
  }

  async setReplication(_bucket: string, _config: ReplicationConfiguration): Promise<void> {
    throw new Error('Replication not supported via Azure Blob adapter');
  }

  async getReplication(_bucket: string): Promise<ReplicationConfiguration> {
    throw new Error('Replication not supported via Azure Blob adapter');
  }

  async setVersioning(_bucket: string, _enabled: boolean): Promise<void> {
    throw new Error('Versioning not supported via Azure Blob adapter');
  }

  async getVersioningStatus(_bucket: string): Promise<boolean> {
    throw new Error('Versioning not supported via Azure Blob adapter');
  }

  async listVersions(_bucket: string, _key: string): Promise<ObjectVersion[]> {
    throw new Error('Versioning not supported via Azure Blob adapter');
  }

  async deleteVersion(_bucket: string, _key: string, _versionId: string): Promise<void> {
    throw new Error('Versioning not supported via Azure Blob adapter');
  }

  async getCapacity(): Promise<StorageCapacityInfo> {
    return { usedBytes: 0, totalBytes: 0, availableBytes: 0, usedPercent: 0 };
  }
}
