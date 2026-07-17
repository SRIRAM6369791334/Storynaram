import type { EntityId } from '@storynaram/core';

export interface SchemaDefinition {
  id: string;
  entityType: string;
  schema: Record<string, unknown>;
  version: string;
  createdBy: EntityId;
}
