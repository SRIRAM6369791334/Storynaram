import type { EntityId } from '@storynaram/core';

export type EntityEventType = 'created' | 'updated' | 'deleted' | 'restored' | 'archived';

export interface EntityEvent<T = Record<string, unknown>> {
  eventType: EntityEventType;
  entityType: string;
  entityId: EntityId;
  data: Partial<T>;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface EntityFilter {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface EntityPage<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface EntityHooks<T> {
  beforeCreate?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  afterCreate?: (entity: T) => void | Promise<void>;
  beforeUpdate?: (id: EntityId, data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  afterUpdate?: (entity: T) => void | Promise<void>;
  beforeDelete?: (id: EntityId) => void | Promise<void>;
  afterDelete?: (id: EntityId) => void | Promise<void>;
  beforeSoftDelete?: (id: EntityId) => void | Promise<void>;
  afterSoftDelete?: (entity: T) => void | Promise<void>;
}

export interface EntityRuntimeOptions {
  enableCaching?: boolean;
  cacheMaxSize?: number;
  enableValidation?: boolean;
  enableEvents?: boolean;
  enableSoftDelete?: boolean;
  entityCacheTtlMs?: number;
}

export interface EntityCacheEntry<T> {
  entity: T;
  expiresAt: number;
}
