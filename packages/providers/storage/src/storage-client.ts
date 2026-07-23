import { Injectable, Logger } from '@nestjs/common';
import type { IStorageAdapter } from './adapters/storage-adapter.interface.js';

@Injectable()
export class StorageClient {
  private readonly logger = new Logger(StorageClient.name);

  constructor(readonly adapter: IStorageAdapter) {}

  get providerName(): string {
    return this.adapter.providerName;
  }

  get providerType(): string {
    return this.adapter.providerType;
  }

  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  async close(): Promise<void> {
    await this.adapter.close();
  }

  async ping(): Promise<boolean> {
    return this.adapter.ping();
  }

  getAdapter(): IStorageAdapter {
    return this.adapter;
  }
}
