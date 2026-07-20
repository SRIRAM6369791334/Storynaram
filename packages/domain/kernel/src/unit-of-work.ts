import { Entity } from './entity';

export enum EntityState {
  UNCHANGED = 'UNCHANGED',
  NEW = 'NEW',
  DIRTY = 'DIRTY',
  DELETED = 'DELETED',
}

interface TrackedEntity {
  entity: Entity;
  state: EntityState;
  originalVersion: number;
}

export interface UnitOfWork {
  registerNew(entity: Entity): void;

  registerDirty(entity: Entity): void;

  registerDeleted(entity: Entity): void;

  commit(): Promise<void>;

  rollback(): Promise<void>;

  getTrackedEntities(): readonly Entity[];

  getState(entity: Entity): EntityState | undefined;
}

export class InMemoryUnitOfWork implements UnitOfWork {
  private readonly tracked = new Map<string, TrackedEntity>();

  registerNew(entity: Entity): void {
    const key = this.getKey(entity);
    if (this.tracked.has(key)) {
      throw new Error(`Entity already tracked: ${key}`);
    }
    this.tracked.set(key, {
      entity,
      state: EntityState.NEW,
      originalVersion: entity.version.value,
    });
  }

  registerDirty(entity: Entity): void {
    const key = this.getKey(entity);
    const existing = this.tracked.get(key);
    if (existing && existing.state === EntityState.NEW) return;
    this.tracked.set(key, {
      entity,
      state: EntityState.DIRTY,
      originalVersion: existing?.originalVersion ?? entity.version.value,
    });
  }

  registerDeleted(entity: Entity): void {
    const key = this.getKey(entity);
    this.tracked.set(key, {
      entity,
      state: EntityState.DELETED,
      originalVersion: entity.version.value,
    });
  }

  async commit(): Promise<void> {
    this.tracked.clear();
  }

  async rollback(): Promise<void> {
    this.tracked.clear();
  }

  getTrackedEntities(): readonly Entity[] {
    return Array.from(this.tracked.values()).map(t => t.entity);
  }

  getState(entity: Entity): EntityState | undefined {
    return this.tracked.get(this.getKey(entity))?.state;
  }

  private getKey(entity: Entity): string {
    return `${entity.constructor.name}:${String(entity.identity.value)}`;
  }
}
