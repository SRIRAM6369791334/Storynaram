import { DynamicModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

export interface StoryEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export abstract class EventBusPort {
  abstract publish(event: StoryEvent): Promise<void>;
  abstract subscribe(eventType: string, handler: (event: StoryEvent) => Promise<void>): void;
}

export class EventBusModule {
  static forRoot(): DynamicModule {
    return {
      module: EventBusModule,
      global: true,
      imports: [CqrsModule],
      exports: [CqrsModule],
    };
  }
}
