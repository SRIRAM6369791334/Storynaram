import { DomainService, Specification } from '@storynaram/domain-kernel';
import { TimelineAggregate } from './timeline-aggregate';
import { TimelineIdentity } from './timeline-identity';
import { TimelineRepositoryContract } from './timeline-repository';
import { EventType, TimelineEvent } from './timeline-event';
import { TimelineDate } from './timeline-date';
import { MainTimelineSpec, BranchTimelineSpec, HistoricalTimelineSpec } from './timeline-specifications';

export class TimelineDomainService extends DomainService {
  constructor(
    private readonly repository: TimelineRepositoryContract,
  ) {
    super('TimelineDomainService');
  }

  async getChronologicalEvents(timelineId: string): Promise<TimelineEvent[]> {
    const identity = new TimelineIdentity(timelineId);
    const timeline = await this.repository.findByIdentity(identity);
    if (!timeline) return [];
    return timeline.getSortedEvents();
  }

  async getEventsByType(timelineId: string, eventType: EventType): Promise<TimelineEvent[]> {
    const identity = new TimelineIdentity(timelineId);
    const timeline = await this.repository.findByIdentity(identity);
    if (!timeline) return [];
    return timeline.eventsOfType(eventType);
  }

  async findRelatedEvents(timelineId: string, eventId: string): Promise<{ causes: TimelineEvent[]; consequences: TimelineEvent[] }> {
    const identity = new TimelineIdentity(timelineId);
    const timeline = await this.repository.findByIdentity(identity);
    if (!timeline) return { causes: [], consequences: [] };
    const event = timeline.events.get(eventId);
    if (!event) return { causes: [], consequences: [] };
    return {
      causes: event.causeEventIds.map(id => timeline.events.get(id)).filter(Boolean) as TimelineEvent[],
      consequences: event.consequenceEventIds.map(id => timeline.events.get(id)).filter(Boolean) as TimelineEvent[],
    };
  }

  async findMainTimelines(): Promise<TimelineAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new MainTimelineSpec();
    return all.filter(t => spec.isSatisfiedBy(t));
  }

  async findBranchedTimelines(): Promise<TimelineAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new BranchTimelineSpec();
    return all.filter(t => spec.isSatisfiedBy(t));
  }

  async findHistoricalTimelines(): Promise<TimelineAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new HistoricalTimelineSpec();
    return all.filter(t => spec.isSatisfiedBy(t));
  }

  async findEventsInDateRange(timelineId: string, start: TimelineDate, end: TimelineDate): Promise<TimelineEvent[]> {
    const identity = new TimelineIdentity(timelineId);
    const timeline = await this.repository.findByIdentity(identity);
    if (!timeline) return [];
    return timeline.eventsInDateRange(start, end);
  }
}
