import { EntityId } from './entity-id.js';

export abstract class BaseEntity {
  abstract entityId: EntityId;
  abstract createdAt: Date;
  abstract updatedAt: Date;
  abstract version: number;

  equals(other: BaseEntity): boolean {
    return this.entityId === other.entityId;
  }

  toJSON(): Record<string, unknown> {
    return {
      entityId: this.entityId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version,
    };
  }
}
