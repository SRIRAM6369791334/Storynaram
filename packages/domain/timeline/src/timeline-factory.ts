import { Factory, FactoryError } from '@storynaram/domain-kernel';
import { TimelineAggregate } from './timeline-aggregate.js';
import { TimelineIdentity } from './timeline-identity.js';
import { TimelineDate } from './timeline-date.js';
import { TimelineCalendar } from './timeline-calendar.js';
import { assertValidEventDate } from './business-rules.js';
import type { EventType } from './timeline-event.js';

export interface CreateTimelineEventInput {
  id?: string;
  title: string;
  description: string;
  year: number;
  month: number;
  day: number;
  era?: string;
  eventType: EventType;
  importance?: number;
  branchId?: string;
  causeIds?: string[];
  tags?: string[];
  location?: string;
}

export interface CreateTimelineProps {
  identity?: string;
  name: string;
  description?: string;
  calendar?: TimelineCalendar;
  initialEvents?: CreateTimelineEventInput[];
}

export class TimelineFactory extends Factory<TimelineAggregate, CreateTimelineProps> {
  create(props: CreateTimelineProps): TimelineAggregate {
    this.assertValid(props.name.length > 0, 'Timeline name is required');

    const identity = props.identity
      ? new TimelineIdentity(props.identity)
      : TimelineIdentity.create();

    const timeline = new TimelineAggregate(identity);

    timeline.initialize(props.name, props.description ?? '');

    if (props.initialEvents) {
      for (const eventInput of props.initialEvents) {
        const date = new TimelineDate(
          eventInput.year,
          eventInput.month,
          eventInput.day,
          eventInput.era,
        );
        assertValidEventDate(date);

        timeline.addEvent(
          eventInput.id ?? `evt-${crypto.randomUUID()}`,
          eventInput.title,
          eventInput.description,
          date,
          eventInput.eventType,
          eventInput.importance ?? 50,
          eventInput.branchId ?? 'main',
          eventInput.causeIds ?? [],
          eventInput.tags ?? [],
          eventInput.location,
        );
      }
    }

    return timeline;
  }

  reconstitute(state: Record<string, unknown>): TimelineAggregate {
    const identity = new TimelineIdentity(state.identity as string);
    const timeline = new TimelineAggregate(identity);
    timeline.initialize(
      state.name as string,
      state.description as string,
    );
    return timeline;
  }
}
