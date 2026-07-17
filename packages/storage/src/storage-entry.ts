import { EntityId } from '@storynaram/core';

export type StorageEntry = {
  id: EntityId;
  entityType: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
