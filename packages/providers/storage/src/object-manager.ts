import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client.js';
import type {
  UploadOptions,
  DownloadOptions,
  UploadResult,
  DownloadResult,
  ObjectMetadata,
  ListResult,
  ListOptions,
  CopySource,
  CopyDestination,
} from './types.js';
import { ObjectError } from './errors.js';

@Injectable()
export class ObjectManager {
  private readonly logger = new Logger(ObjectManager.name);

  constructor(private readonly client: StorageClient) {}

  async upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    try {
      this.logger.debug(`Uploading ${bucket}/${key} (${data.length} bytes)`);
      return await this.client.getAdapter().upload(bucket, key, data, options);
    } catch (err) {
      throw new ObjectError(`Failed to upload ${bucket}/${key}: ${(err as Error).message}`);
    }
  }

  async download(bucket: string, key: string, options?: DownloadOptions): Promise<DownloadResult> {
    return this.client.getAdapter().download(bucket, key, options);
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this.client.getAdapter().delete(bucket, key);
  }

  async copy(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.client.getAdapter().copy(source, destination);
  }

  async move(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.client.getAdapter().move(source, destination);
  }

  async rename(bucket: string, oldKey: string, newKey: string): Promise<void> {
    await this.client.getAdapter().rename(bucket, oldKey, newKey);
  }

  async list(bucket: string, options?: ListOptions): Promise<ListResult> {
    return this.client.getAdapter().list(bucket, options);
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    return this.client.getAdapter().exists(bucket, key);
  }

  async getMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    return this.client.getAdapter().getMetadata(bucket, key);
  }

  async setMetadata(bucket: string, key: string, metadata: Record<string, string>): Promise<void> {
    await this.client.getAdapter().setMetadata(bucket, key, metadata);
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    return this.client.getAdapter().getTags(bucket, key);
  }

  async setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    await this.client.getAdapter().setTags(bucket, key, tags);
  }
}
