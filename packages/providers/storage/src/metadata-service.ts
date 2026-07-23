import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client.js';
import type { ObjectMetadata } from './types.js';
import { MetadataError } from './errors.js';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(private readonly client: StorageClient) {}

  async get(bucket: string, key: string): Promise<ObjectMetadata> {
    try {
      return await this.client.getAdapter().getMetadata(bucket, key);
    } catch (err) {
      throw new MetadataError(`Failed to get metadata for ${bucket}/${key}: ${(err as Error).message}`);
    }
  }

  async set(bucket: string, key: string, metadata: Record<string, string>): Promise<void> {
    try {
      await this.client.getAdapter().setMetadata(bucket, key, metadata);
    } catch (err) {
      throw new MetadataError(`Failed to set metadata for ${bucket}/${key}: ${(err as Error).message}`);
    }
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    return this.client.getAdapter().getTags(bucket, key);
  }

  async setTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    await this.client.getAdapter().setTags(bucket, key, tags);
  }
}
