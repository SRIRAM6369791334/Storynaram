import { describe, it, expect } from 'vitest';
import {
  TimelineCreatedEvent,
  TimelineEventAddedEvent,
  TimelineBranchCreatedEvent,
  TimelineMergedEvent,
  TimelineArchivedEvent,
} from '../src/timeline-events';

describe('TimelineCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new TimelineCreatedEvent('timeline-1', { name: 'Main', description: 'Primary' });
    expect(event.eventType).toBe('timeline.created');
    expect(event.aggregateId).toBe('timeline-1');
    expect(event.payload.name).toBe('Main');
  });
});

describe('TimelineEventAddedEvent', () => {
  it('creates with event info', () => {
    const event = new TimelineEventAddedEvent('timeline-1', {
      eventId: 'evt-1',
      title: 'Battle',
      eventType: 'war',
      date: { year: 2024, month: 6, day: 15, era: 'CE' },
    });
    expect(event.eventType).toBe('timeline.event.added');
    expect(event.payload.eventId).toBe('evt-1');
  });
});

describe('TimelineBranchCreatedEvent', () => {
  it('creates with branch info', () => {
    const event = new TimelineBranchCreatedEvent('timeline-1', {
      branchId: 'alt-1',
      branchName: 'What If',
      parentBranchId: 'main',
    });
    expect(event.eventType).toBe('timeline.branch.created');
    expect(event.payload.branchName).toBe('What If');
  });
});

describe('TimelineMergedEvent', () => {
  it('creates with merge info', () => {
    const event = new TimelineMergedEvent('timeline-1', {
      sourceBranchId: 'alt-1',
      targetBranchId: 'main',
    });
    expect(event.eventType).toBe('timeline.merged');
    expect(event.payload.sourceBranchId).toBe('alt-1');
  });
});

describe('TimelineArchivedEvent', () => {
  it('creates with payload', () => {
    const event = new TimelineArchivedEvent('timeline-1', { name: 'Old Timeline' });
    expect(event.eventType).toBe('timeline.archived');
    expect(event.aggregateId).toBe('timeline-1');
  });
});
