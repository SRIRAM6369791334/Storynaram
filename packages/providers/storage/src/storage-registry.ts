import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client';
import { ProviderNotFoundError } from './errors';
import type { IStorageAdapter } from './adapters/storage-adapter.interface';

@Injectable()
export class StorageRegistry {
  private readonly logger = new Logger(StorageRegistry.name);
  private readonly providers = new Map<string, StorageClient>();

  register(name: string, client: StorageClient): void {
    this.providers.set(name, client);
    this.logger.log(`Storage provider registered: ${name}`);
  }

  getClient(name: string): StorageClient {
    const client = this.providers.get(name);
    if (!client) throw new ProviderNotFoundError(name);
    return client;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  getAllProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getAllClients(): StorageClient[] {
    return Array.from(this.providers.values());
  }

  async pingAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [name, client] of this.providers) {
      results[name] = await client.ping();
    }
    return results;
  }

  async closeAll(): Promise<void> {
    for (const [name, client] of this.providers) {
      await client.close();
      this.logger.log(`Storage provider closed: ${name}`);
    }
    this.providers.clear();
  }
}
