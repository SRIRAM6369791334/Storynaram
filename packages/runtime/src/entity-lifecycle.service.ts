import { Injectable } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { EntityHooks } from './types';

@Injectable()
export class EntityLifecycleService {
  private readonly hooksMap = new Map<string, EntityHooks<unknown>>();

  register<T>(entityType: string, hooks: EntityHooks<T>): void {
    this.hooksMap.set(entityType, hooks as EntityHooks<unknown>);
  }

  unregister(entityType: string): void {
    this.hooksMap.delete(entityType);
  }

  get<T>(entityType: string): EntityHooks<T> | undefined {
    return this.hooksMap.get(entityType) as EntityHooks<T> | undefined;
  }

  has(entityType: string): boolean {
    return this.hooksMap.has(entityType);
  }

  async runBeforeCreate<T>(entityType: string, data: Partial<T>): Promise<Partial<T>> {
    const hooks = this.get<T>(entityType);
    if (hooks?.beforeCreate) {
      return hooks.beforeCreate(data);
    }
    return data;
  }

  async runAfterCreate<T>(entityType: string, entity: T): Promise<void> {
    const hooks = this.get<T>(entityType);
    await hooks?.afterCreate?.(entity);
  }

  async runBeforeUpdate<T>(entityType: string, id: EntityId, data: Partial<T>): Promise<Partial<T>> {
    const hooks = this.get<T>(entityType);
    if (hooks?.beforeUpdate) {
      return hooks.beforeUpdate(id, data);
    }
    return data;
  }

  async runAfterUpdate<T>(entityType: string, entity: T): Promise<void> {
    const hooks = this.get<T>(entityType);
    await hooks?.afterUpdate?.(entity);
  }

  async runBeforeDelete(entityType: string, id: EntityId): Promise<void> {
    const hooks = this.get(entityType);
    await hooks?.beforeDelete?.(id);
  }

  async runAfterDelete(entityType: string, id: EntityId): Promise<void> {
    const hooks = this.get(entityType);
    await hooks?.afterDelete?.(id);
  }

  async runBeforeSoftDelete(entityType: string, id: EntityId): Promise<void> {
    const hooks = this.get(entityType);
    await hooks?.beforeSoftDelete?.(id);
  }

  async runAfterSoftDelete<T>(entityType: string, entity: T): Promise<void> {
    const hooks = this.get<T>(entityType);
    await hooks?.afterSoftDelete?.(entity);
  }
}
