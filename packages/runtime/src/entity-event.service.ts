import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { EventBusPort, StoryEvent } from '@storynaram/events';
import type { EntityEventType, EntityEvent } from './types.js';
import { RuntimeConfig } from './runtime-config.js';

@Injectable()
export class EntityEventService {
  private readonly logger = new Logger(EntityEventService.name);

  constructor(
    private readonly eventBus: EventBusPort,
    private readonly config: RuntimeConfig,
  ) {}

  async emit<T = Record<string, unknown>>(
    eventType: EntityEventType,
    entityType: string,
    entityId: EntityId,
    data: Partial<T>,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.config.enableEvents) return;

    const event: EntityEvent<T> = {
      eventType,
      entityType,
      entityId,
      data,
      timestamp: new Date(),
      metadata,
    };

    const storyEvent: StoryEvent = {
      eventId: crypto.randomUUID(),
      eventType: `entity.${entityType}.${eventType}`,
      aggregateId: entityId,
      timestamp: event.timestamp,
      payload: event as unknown as Record<string, unknown>,
    };

    try {
      await this.eventBus.publish(storyEvent);
    } catch (error) {
      this.logger.error(
        `Failed to emit event ${storyEvent.eventType} for ${entityType}:${entityId}`,
        error,
      );
    }
  }
}
