import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client';
import type { LifecycleRule } from './types';
import { LifecycleError } from './errors';

@Injectable()
export class LifecycleManager {
  private readonly logger = new Logger(LifecycleManager.name);

  constructor(private readonly client: StorageClient) {}

  async setRules(bucket: string, rules: LifecycleRule[]): Promise<void> {
    try {
      await this.client.getAdapter().setLifecycleRules(bucket, rules);
      this.logger.log(`Lifecycle rules set for bucket ${bucket}`);
    } catch (err) {
      throw new LifecycleError(`Failed to set lifecycle rules: ${(err as Error).message}`);
    }
  }

  async getRules(bucket: string): Promise<LifecycleRule[]> {
    try {
      return await this.client.getAdapter().getLifecycleRules(bucket);
    } catch (err) {
      throw new LifecycleError(`Failed to get lifecycle rules: ${(err as Error).message}`);
    }
  }
}
