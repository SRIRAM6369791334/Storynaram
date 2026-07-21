import { describe, it, expect } from 'vitest';
import { TimelineAggregate } from '../src/timeline-aggregate';
import { TimelineIdentity } from '../src/timeline-identity';
import { TimelineDate } from '../src/timeline-date';
import { TimelineDuration } from '../src/timeline-date';
import { TimelineEra } from '../src/timeline-era';
import { TimelineCalendar } from '../src/timeline-calendar';

describe('TimelineAggregate', () => {
  it('creates with identity', () => {
    const timeline = new TimelineAggregate(TimelineIdentity.create());
    expect(timeline.identity).toBeDefined();
  });

  it('initializes with name', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Main Timeline', 'Primary timeline');
    expect(timeline.name).toBe('Main Timeline');
    expect(timeline.description).toBe('Primary timeline');
  });

  it('emits created event on initialize', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    expect(timeline.domainEvents.some(e => e.eventType === 'timeline.created')).toBe(true);
  });

  it('adds events in chronological order', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('evt-1', 'First', '', new TimelineDate(2024, 1, 1), 'historical', 50);
    timeline.addEvent('evt-2', 'Second', '', new TimelineDate(2024, 6, 15), 'character', 75);
    expect(timeline.events.count).toBe(2);
    expect(timeline.domainEvents.some(e => e.eventType === 'timeline.event.added')).toBe(true);
  });

  it('rejects event before last event in branch', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('evt-1', 'First', '', new TimelineDate(2024, 6, 15), 'historical');
    expect(() => {
      timeline.addEvent('evt-2', 'Second', '', new TimelineDate(2024, 1, 1), 'character');
    }).toThrow();
  });

  it('rejects event in non-existent branch', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    expect(() => {
      timeline.addEvent('evt-1', 'Test', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'ghost-branch');
    }).toThrow();
  });

  it('removes events', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('evt-1', 'Test', '', new TimelineDate(2024, 1, 1), 'historical');
    timeline.removeEvent('evt-1');
    expect(timeline.events.count).toBe(0);
  });

  it('filters events by type', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('evt-1', 'War', '', new TimelineDate(2024, 1, 1), 'war');
    timeline.addEvent('evt-2', 'Discovery', '', new TimelineDate(2024, 6, 1), 'discovery');
    const wars = timeline.eventsOfType('war');
    expect(wars).toHaveLength(1);
    expect(wars[0]!.title).toBe('War');
  });

  it('filters events by date range', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('evt-1', 'Early', '', new TimelineDate(2024, 1, 1), 'historical');
    timeline.addEvent('evt-2', 'Middle', '', new TimelineDate(2024, 6, 15), 'historical');
    timeline.addEvent('evt-3', 'Late', '', new TimelineDate(2024, 12, 31), 'historical');
    const mid = timeline.eventsInDateRange(
      new TimelineDate(2024, 3, 1),
      new TimelineDate(2024, 9, 1),
    );
    expect(mid).toHaveLength(1);
    expect(mid[0]!.title).toBe('Middle');
  });

  it('creates branches', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.createBranch('alt-1', 'Alternate', 'What-if scenario', new TimelineDate(2024, 1, 1));
    expect(timeline.branches.count).toBe(2);
    expect(timeline.branches.get('alt-1')?.name).toBe('Alternate');
    expect(timeline.domainEvents.some(e => e.eventType === 'timeline.branch.created')).toBe(true);
  });

  it('allows events in different branches', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.createBranch('alt', 'Alt', '', new TimelineDate(2024, 1, 1));
    timeline.addEvent('evt-1', 'Main event', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'main');
    timeline.addEvent('evt-2', 'Alt event', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'alt');
    expect(timeline.events.count).toBe(2);
    expect(timeline.eventsInBranch('main')).toHaveLength(1);
    expect(timeline.eventsInBranch('alt')).toHaveLength(1);
  });

  it('archives branches', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.createBranch('alt', 'Alt', '', new TimelineDate(2024, 1, 1));
    timeline.archiveBranch('alt');
    expect(timeline.branches.get('alt')?.isActive).toBe(false);
  });

  it('merges branches', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.createBranch('alt', 'Alt', '', new TimelineDate(2024, 1, 1));
    timeline.addEvent('evt-1', 'Shared', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'main');
    timeline.addEvent('evt-2', 'Alt only', '', new TimelineDate(2024, 6, 1), 'historical', 50, 'alt');
    timeline.mergeBranch('alt', 'main');
    expect(timeline.domainEvents.some(e => e.eventType === 'timeline.merged')).toBe(true);
    expect(timeline.eventsInBranch('main')).toHaveLength(2);
  });

  it('manages eras', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    const era = new TimelineEra('era-1', 'Golden Age', new TimelineDate(100, 1, 1));
    timeline.addEra(era);
    expect(timeline.eras.count).toBe(1);
  });

  it('supports causal links', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('cause', 'Cause', '', new TimelineDate(2024, 1, 1), 'historical');
    timeline.addEvent('effect', 'Effect', '', new TimelineDate(2024, 6, 1), 'historical');
    timeline.addCausalLink('cause', 'effect');
    const cause = timeline.events.get('cause');
    expect(cause?.consequenceEventIds).toContain('effect');
    const effect = timeline.events.get('effect');
    expect(effect?.causeEventIds).toContain('cause');
  });

  it('rejects causal link when effect before cause', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('effect', 'Effect', '', new TimelineDate(2024, 1, 1), 'historical');
    timeline.addEvent('cause', 'Cause', '', new TimelineDate(2024, 6, 1), 'historical');
    expect(() => timeline.addCausalLink('cause', 'effect')).toThrow();
  });

  it('archives timeline', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.archive();
    expect(timeline.isArchived).toBe(true);
    expect(timeline.isDeleted()).toBe(true);
    expect(timeline.domainEvents.some(e => e.eventType === 'timeline.archived')).toBe(true);
  });

  it('supports snapshots', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('evt-1', 'Test', '', new TimelineDate(2024, 1, 1), 'historical');
    const snapshot = timeline.createSnapshot();
    expect(snapshot.aggregateId).toBe('1');
    expect(snapshot.version).toBe(timeline.version.value);
  });

  it('version increments on changes', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    const v1 = timeline.version.value;
    timeline.addEvent('evt-1', 'Test', '', new TimelineDate(2024, 1, 1), 'historical');
    expect(timeline.version.value).toBe(v1 + 1);
  });

  it('getSortedEvents returns chronological order', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.addEvent('first', 'First', '', new TimelineDate(2023, 1, 1), 'historical');
    timeline.addEvent('second', 'Second', '', new TimelineDate(2024, 1, 1), 'historical');
    timeline.addEvent('third', 'Third', '', new TimelineDate(2025, 1, 1), 'historical');
    const sorted = timeline.getSortedEvents();
    expect(sorted[0]!.title).toBe('First');
    expect(sorted[2]!.title).toBe('Third');
  });

  it('toJSON serializes all fields', () => {
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test Timeline', 'A test');
    timeline.addEvent('evt-1', 'Event', '', new TimelineDate(2024, 1, 1), 'historical');
    const json = timeline.toJSON();
    expect(json.name).toBe('Test Timeline');
    expect(json.events).toBeDefined();
    expect(json.branches).toBeDefined();
    expect(json.eras).toBeDefined();
    expect(json.calendar).toBeDefined();
    expect(json.statistics).toBeDefined();
    expect(json.isArchived).toBe(false);
  });
});
