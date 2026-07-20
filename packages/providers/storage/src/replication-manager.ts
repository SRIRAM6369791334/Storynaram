import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client';
import type { ReplicationConfiguration } from './types';
import { ReplicationError } from './errors';

@Injectable()
export class ReplicationManager {
  private readonly logger = new Logger(ReplicationManager.name);

  constructor(private readonly client: StorageClient) {}

  async setConfig(bucket: string, config: ReplicationConfiguration): Promise<void> {
    try {
      await this.client.getAdapter().setReplication(bucket, config);
      this.logger.log(`Replication configured for bucket ${bucket}`);
    } catch (err) {
      throw new ReplicationError(`Failed to set replication: ${(err as Error).message}`);
    }
  }

  async getConfig(bucket: string): Promise<ReplicationConfiguration> {
    try {
      return await this.client.getAdapter().getReplication(bucket);
    } catch (err) {
      throw new ReplicationError(`Failed to get replication: ${(err as Error).message}`);
    }
  }
}
