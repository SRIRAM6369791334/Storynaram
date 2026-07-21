import { describe, it, expect } from 'vitest';
import { TimelineAggregate } from '../src/timeline-aggregate';
import { TimelineIdentity } from '../src/timeline-identity';
import { TimelineDate } from '../src/timeline-date';
import {
  MainTimelineSpec,
  BranchTimelineSpec,
  HistoricalTimelineSpec,
  CharacterTimelineSpec,
  WorldTimelineSpec,
} from '../src/timeline-specifications';

describe('Specifications', () => {
  it('MainTimelineSpec matches active main timelines', () => {
    const spec = new MainTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Main', '');
    expect(spec.isSatisfiedBy(timeline)).toBe(true);
  });

  it('MainTimelineSpec does not match archived timelines', () => {
    const spec = new MainTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Main', '');
    timeline.archive();
    expect(spec.isSatisfiedBy(timeline)).toBe(false);
  });

  it('BranchTimelineSpec matches timelines with branches', () => {
    const spec = new BranchTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    expect(spec.isSatisfiedBy(timeline)).toBe(false);
    timeline.createBranch('branch-1', 'Branch', '', new TimelineDate(2024, 1, 1));
    expect(spec.isSatisfiedBy(timeline)).toBe(true);
  });

  it('HistoricalTimelineSpec matches timelines with historical events', () => {
    const spec = new HistoricalTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    expect(spec.isSatisfiedBy(timeline)).toBe(false);
    timeline.addEvent('evt-1', 'War', '', new TimelineDate(2024, 1, 1), 'historical');
    expect(spec.isSatisfiedBy(timeline)).toBe(true);
  });

  it('CharacterTimelineSpec matches timelines with character events', () => {
    const spec = new CharacterTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    expect(spec.isSatisfiedBy(timeline)).toBe(false);
    timeline.addEvent('evt-1', 'Birth', '', new TimelineDate(2024, 1, 1), 'character');
    expect(spec.isSatisfiedBy(timeline)).toBe(true);
  });

  it('WorldTimelineSpec matches timelines with world events', () => {
    const spec = new WorldTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    expect(spec.isSatisfiedBy(timeline)).toBe(false);
    timeline.addEvent('evt-1', 'Creation', '', new TimelineDate(2024, 1, 1), 'world');
    expect(spec.isSatisfiedBy(timeline)).toBe(true);
  });

  it('supports and composition', () => {
    const main = new MainTimelineSpec();
    const branched = new BranchTimelineSpec();
    const timeline = new TimelineAggregate(new TimelineIdentity('1'));
    timeline.initialize('Test', '');
    timeline.createBranch('b1', 'B1', '', new TimelineDate(2024, 1, 1));
    expect(main.isSatisfiedBy(timeline)).toBe(true);
    expect(branched.isSatisfiedBy(timeline)).toBe(true);
  });
});
