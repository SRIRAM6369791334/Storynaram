import type { SchemaDefinition } from './schema-definition.js';

export interface SchemaRegistry {
  register(schema: SchemaDefinition): Promise<void>;
  get(entityType: string): Promise<SchemaDefinition | undefined>;
  getAll(): Promise<SchemaDefinition[]>;
  remove(entityType: string): Promise<void>;
}
