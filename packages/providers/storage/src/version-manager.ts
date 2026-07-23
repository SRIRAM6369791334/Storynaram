import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client.js';
import type { ObjectVersion } from './types.js';
import { VersionError } from './errors.js';

@Injectable()
export class VersionManager {
  private readonly logger = new Logger(VersionManager.name);

  constructor(private readonly client: StorageClient) {}

  async listVersions(bucket: string, key: string): Promise<ObjectVersion[]> {
    try {
      return await this.client.getAdapter().listVersions(bucket, key);
    } catch (err) {
      throw new VersionError(`Failed to list versions for ${bucket}/${key}: ${(err as Error).message}`);
    }
  }

  async deleteVersion(bucket: string, key: string, versionId: string): Promise<void> {
    try {
      await this.client.getAdapter().deleteVersion(bucket, key, versionId);
      this.logger.debug(`Version ${versionId} deleted for ${bucket}/${key}`);
    } catch (err) {
      throw new VersionError(`Failed to delete version ${versionId}: ${(err as Error).message}`);
    }
  }

  async setVersioning(bucket: string, enabled: boolean): Promise<void> {
    try {
      await this.client.getAdapter().setVersioning(bucket, enabled);
      this.logger.log(`Versioning ${enabled ? 'enabled' : 'disabled'} for bucket ${bucket}`);
    } catch (err) {
      throw new VersionError(`Failed to set versioning: ${(err as Error).message}`);
    }
  }

  async getVersioningStatus(bucket: string): Promise<boolean> {
    return this.client.getAdapter().getVersioningStatus(bucket);
  }
}
