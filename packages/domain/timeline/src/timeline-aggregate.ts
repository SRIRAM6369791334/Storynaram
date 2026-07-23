import { AggregateRoot, DomainSnapshot, Timestamp } from '@storynaram/domain-kernel';
import { TimelineIdentity } from './timeline-identity.js';
import { TimelineDate } from './timeline-date.js';
import { TimelineDuration } from './timeline-date.js';
import { TimelineCalendar } from './timeline-calendar.js';
import { TimelineEvent, TimelineEvents, EventType } from './timeline-event.js';
import { TimelineBranch, TimelineBranches } from './timeline-branch.js';
import { TimelineEra, TimelineEras } from './timeline-era.js';
import { TimelineStatistics } from './timeline-statistics.js';
import {
  TimelineCreatedEvent,
  TimelineEventAddedEvent,
  TimelineBranchCreatedEvent,
  TimelineMergedEvent,
  TimelineArchivedEvent,
} from './timeline-events.js';
import { BranchConsistencyRule, CausalityValidationRule, CircularDependencyRule, ChronologicalOrderRule, ParentBranchRule } from './business-rules.js';

export class TimelineAggregate extends AggregateRoot<TimelineIdentity> {
  private _name: string;
  private _description: string;
  private _events: TimelineEvents;
  private _branches: TimelineBranches;
  private _eras: TimelineEras;
  private _calendar: TimelineCalendar;
  private _statistics: TimelineStatistics;
  private _isArchived: boolean;

  constructor(identity: TimelineIdentity) {
    super(identity);
    this._name = '';
    this._description = '';
    this._events = new TimelineEvents();
    this._branches = new TimelineBranches([]);
    this._eras = new TimelineEras();
    this._calendar = TimelineCalendar.standard();
    this._statistics = new TimelineStatistics();
    this._isArchived = false;
  }

  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get events(): TimelineEvents { return this._events; }
  get branches(): TimelineBranches { return this._branches; }
  get eras(): TimelineEras { return this._eras; }
  get calendar(): TimelineCalendar { return this._calendar; }
  get statistics(): TimelineStatistics { return this._statistics; }
  get isArchived(): boolean { return this._isArchived; }

  initialize(name: string, description: string = ''): void {
    this._name = name;
    this._description = description;
    this.addDomainEvent(new TimelineCreatedEvent(
      this.identity.value,
      { name, description },
    ));
    this.markUpdated();
  }

  addEvent(
    id: string,
    title: string,
    description: string,
    date: TimelineDate,
    eventType: EventType,
    importance: number = 50,
    branchId: string = 'main',
    causeIds: string[] = [],
    tags: string[] = [],
    location?: string,
    duration?: TimelineDuration,
  ): void {
    const branchRule = new BranchConsistencyRule(branchId, this._branches as any);
    if (branchRule.check()) throw new Error(branchRule.check()!.message);

    const chronoRule = new ChronologicalOrderRule(date, branchId, this._events);
    const chronoViolation = chronoRule.check();
    if (chronoViolation) throw new Error(chronoViolation.message);

    const causalityRule = new CausalityValidationRule(causeIds, date, this._events);
    const causalityViolation = causalityRule.check();
    if (causalityViolation) throw new Error(causalityViolation.message);

    const circularRule = new CircularDependencyRule(id, causeIds, this._events);
    const circularViolation = circularRule.check();
    if (circularViolation) throw new Error(circularViolation.message);

    const event = new TimelineEvent(
      id, title, description, date, eventType, importance,
      branchId, causeIds, [], tags, location, duration,
    );

    this._events = this._events.add(event);

    for (const causeId of causeIds) {
      const causeEvent = this._events.get(causeId);
      if (causeEvent) {
        const updated = new TimelineEvent(
          causeEvent.id, causeEvent.title, causeEvent.description,
          causeEvent.date, causeEvent.eventType, causeEvent.importance,
          causeEvent.branchId, causeEvent.causeEventIds,
          [...causeEvent.consequenceEventIds, id],
          causeEvent.tags, causeEvent.location, causeEvent.duration,
        );
        this._events = this._events.remove(causeId);
        this._events = this._events.add(updated);
      }
    }

    this.addDomainEvent(new TimelineEventAddedEvent(
      this.identity.value,
      { eventId: id, title, eventType, date: date.toJSON() },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  removeEvent(eventId: string): void {
    if (!this._events.has(eventId)) throw new Error(`Event not found: ${eventId}`);
    this._events = this._events.remove(eventId);
    this.markUpdated();
    this.refreshStatistics();
  }

  eventsOfType(eventType: EventType): TimelineEvent[] {
    return this._events.ofType(eventType);
  }

  eventsInBranch(branchId: string): TimelineEvent[] {
    return this._events.inBranch(branchId);
  }

  eventsInDateRange(start: TimelineDate, end: TimelineDate): TimelineEvent[] {
    return this._events.inDateRange(start, end);
  }

  createBranch(id: string, name: string, description: string, createdAt: TimelineDate, parentBranchId?: string): void {
    const parentRule = new ParentBranchRule(parentBranchId, this._branches as any);
    const parentViolation = parentRule.check();
    if (parentViolation) throw new Error(parentViolation.message);

    const branch = new TimelineBranch(id, name, description, createdAt, parentBranchId);
    this._branches = this._branches.add(branch);
    this.addDomainEvent(new TimelineBranchCreatedEvent(
      this.identity.value,
      { branchId: id, branchName: name, parentBranchId },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  archiveBranch(branchId: string): void {
    this._branches = this._branches.archive(branchId);
    this.markUpdated();
  }

  mergeBranch(sourceBranchId: string, targetBranchId: string): void {
    const sourceBranch = this._branches.get(sourceBranchId);
    if (!sourceBranch) throw new Error(`Source branch not found: ${sourceBranchId}`);
    if (!this._branches.get(targetBranchId)) throw new Error(`Target branch not found: ${targetBranchId}`);

    const sourceEvents = this._events.inBranch(sourceBranchId);
    for (const event of sourceEvents) {
      const mergedEvent = new TimelineEvent(
        event.id, event.title, event.description, event.date,
        event.eventType, event.importance, targetBranchId,
        event.causeEventIds, event.consequenceEventIds, event.tags,
        event.location, event.duration,
      );
      this._events = this._events.add(mergedEvent);
    }

    this._branches = this._branches.archive(sourceBranchId);
    const updatedBranch = new TimelineBranch(
      sourceBranch.id, sourceBranch.name, sourceBranch.description,
      sourceBranch.createdAt, sourceBranch.parentBranchId, false, true,
    );
    this._branches = this._branches.add(updatedBranch);

    this.addDomainEvent(new TimelineMergedEvent(
      this.identity.value,
      { sourceBranchId, targetBranchId },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  addEra(era: TimelineEra): void {
    this._eras = this._eras.add(era);
    this.markUpdated();
    this.refreshStatistics();
  }

  addCausalLink(causeId: string, effectId: string): void {
    const cause = this._events.get(causeId);
    const effect = this._events.get(effectId);
    if (!cause) throw new Error(`Cause event not found: ${causeId}`);
    if (!effect) throw new Error(`Effect event not found: ${effectId}`);

    const causalityRule = new CausalityValidationRule([causeId], effect.date, this._events);
    const causalityViolation = causalityRule.check();
    if (causalityViolation) throw new Error(causalityViolation.message);

    const circularRule = new CircularDependencyRule(effectId, [causeId], this._events);
    const circularViolation = circularRule.check();
    if (circularViolation) throw new Error(circularViolation.message);

    const updatedCause = new TimelineEvent(
      cause.id, cause.title, cause.description, cause.date,
      cause.eventType, cause.importance, cause.branchId,
      cause.causeEventIds, [...cause.consequenceEventIds, effectId],
      cause.tags, cause.location, cause.duration,
    );
    this._events = this._events.remove(causeId);
    this._events = this._events.add(updatedCause);

    const updatedEffect = new TimelineEvent(
      effect.id, effect.title, effect.description, effect.date,
      effect.eventType, effect.importance, effect.branchId,
      [...effect.causeEventIds, causeId], effect.consequenceEventIds,
      effect.tags, effect.location, effect.duration,
    );
    this._events = this._events.remove(effectId);
    this._events = this._events.add(updatedEffect);

    this.markUpdated();
  }

  archive(): void {
    this._isArchived = true;
    this.addDomainEvent(new TimelineArchivedEvent(
      this.identity.value,
      { name: this._name },
    ));
    this.delete();
  }

  getSortedEvents(): TimelineEvent[] {
    return this._events.sorted();
  }

  private refreshStatistics(): void {
    const mainEvents = this._events.inBranch('main');
    const totalImportance = this._events.all.reduce((sum, e) => sum + e.importance, 0);
    const sorted = this._events.sorted();
    const firstEvent = sorted[0];
    const lastEvent = sorted[sorted.length - 1];
    this._statistics = new TimelineStatistics({
      totalEvents: this._events.count,
      mainBranchEvents: mainEvents.length,
      branchCount: this._branches.count,
      eraCount: this._eras.count,
      averageImportance: this._events.count > 0 ? Math.round(totalImportance / this._events.count) : 0,
      dateRangeStart: firstEvent ? `${firstEvent.date.year}-${firstEvent.date.month}` : '',
      dateRangeEnd: lastEvent ? `${lastEvent.date.year}-${lastEvent.date.month}` : '',
    });
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      name: this._name,
      description: this._description,
      events: this._events.toJSON(),
      branches: this._branches.toJSON(),
      eras: this._eras.toJSON(),
      calendar: this._calendar.toJSON(),
      statistics: this._statistics.toJSON(),
      isArchived: this._isArchived,
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    const data = snapshot.data;
    this._name = data.name as string;
    this._description = data.description as string;
    this._events = data.events as TimelineEvents;
    this._branches = data.branches as TimelineBranches;
    this._eras = data.eras as TimelineEras;
    this._calendar = data.calendar as TimelineCalendar;
    this._statistics = data.statistics as TimelineStatistics;
    this._isArchived = data.isArchived as boolean;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      name: this._name,
      description: this._description,
      events: this._events.toJSON(),
      branches: this._branches.toJSON(),
      eras: this._eras.toJSON(),
      calendar: this._calendar.toJSON(),
      statistics: this._statistics.toJSON(),
      isArchived: this._isArchived,
    };
  }
}
