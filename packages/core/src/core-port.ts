import { Injectable } from '@nestjs/common';
import { EntityId } from './entity-id.js';

@Injectable()
export abstract class CorePort {
  abstract getEntity(entityId: EntityId): Promise<unknown>;
  abstract saveEntity(entity: unknown): Promise<void>;
  abstract deleteEntity(entityId: EntityId): Promise<void>;
}
