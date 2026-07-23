import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client.js';
import type { BucketOptions, LifecycleRule, ReplicationConfiguration } from './types.js';
import { BucketError, BucketNotFoundError, BucketAlreadyExistsError } from './errors.js';

@Injectable()
export class BucketManager {
  private readonly logger = new Logger(BucketManager.name);

  constructor(private readonly client: StorageClient) {}

  async create(name: string, options?: BucketOptions): Promise<void> {
    try {
      await this.client.getAdapter().createBucket(name, options);
      this.logger.log(`Bucket created: ${name}`);
    } catch (err) {
      if (err instanceof BucketAlreadyExistsError) throw err;
      throw new BucketError(`Failed to create bucket ${name}: ${(err as Error).message}`);
    }
  }

  async delete(name: string): Promise<void> {
    try {
      await this.client.getAdapter().deleteBucket(name);
      this.logger.log(`Bucket deleted: ${name}`);
    } catch (err) {
      if (err instanceof BucketNotFoundError) throw err;
      throw new BucketError(`Failed to delete bucket ${name}: ${(err as Error).message}`);
    }
  }

  async list(): Promise<string[]> {
    return this.client.getAdapter().listBuckets();
  }

  async exists(name: string): Promise<boolean> {
    return this.client.getAdapter().bucketExists(name);
  }

  async setLifecycleRules(bucket: string, rules: LifecycleRule[]): Promise<void> {
    await this.client.getAdapter().setLifecycleRules(bucket, rules);
  }

  async getLifecycleRules(bucket: string): Promise<LifecycleRule[]> {
    return this.client.getAdapter().getLifecycleRules(bucket);
  }

  async setVersioning(bucket: string, enabled: boolean): Promise<void> {
    await this.client.getAdapter().setVersioning(bucket, enabled);
  }

  async getVersioningStatus(bucket: string): Promise<boolean> {
    return this.client.getAdapter().getVersioningStatus(bucket);
  }

  async setReplication(bucket: string, config: ReplicationConfiguration): Promise<void> {
    await this.client.getAdapter().setReplication(bucket, config);
  }

  async getReplication(bucket: string): Promise<ReplicationConfiguration> {
    return this.client.getAdapter().getReplication(bucket);
  }
}
