import { Injectable } from '@nestjs/common';
import { SchemaEntry } from './schema-entry.js';

@Injectable()
export abstract class RegistryPort {
  abstract getSchema(entityType: string): Promise<SchemaEntry | undefined>;
  abstract registerSchema(entry: SchemaEntry): Promise<void>;
  abstract unregisterSchema(entityType: string): Promise<void>;
  abstract listSchemas(): Promise<SchemaEntry[]>;
}
