import { Injectable } from '@nestjs/common';
import { StorageEntry } from './storage-entry.js';

@Injectable()
export abstract class StoragePort {
  abstract get(id: string): Promise<StorageEntry | undefined>;
  abstract save(entry: StorageEntry): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract list(entityType?: string): Promise<StorageEntry[]>;
}
