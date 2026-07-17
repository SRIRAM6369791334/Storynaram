import { EntityId } from '@storynaram/core';

export type SchemaDefinition = {
  id: string;
  entityType: string;
  schema: Record<string, unknown>;
  version: string;
  createdBy: EntityId;
};

export type SchemaEntry = {
  entityType: string;
  definition: SchemaDefinition;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
