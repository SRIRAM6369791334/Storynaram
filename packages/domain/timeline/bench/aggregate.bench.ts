import { bench, describe } from 'vitest';
import { TimelineAggregate } from '../src/timeline-aggregate';
import { TimelineIdentity } from '../src/timeline-identity';
import { TimelineDate } from '../src/timeline-date';

describe('TimelineAggregate benchmarks', () => {
  const timeline = new TimelineAggregate(TimelineIdentity.create());
  timeline.initialize('Bench', '');

  bench('add events', () => {
    const t = new TimelineAggregate(TimelineIdentity.create());
    t.initialize('Bench', '');
    for (let i = 0; i < 100; i++) {
      t.addEvent(`evt-${i}`, `Event ${i}`, '', new TimelineDate(2024, 1, i + 1), 'historical');
    }
  });

  bench('get sorted events', () => {
    timeline.getSortedEvents();
  });

  bench('events of type', () => {
    timeline.eventsOfType('historical');
  });

  bench('events in date range', () => {
    timeline.eventsInDateRange(
      new TimelineDate(2024, 1, 1),
      new TimelineDate(2024, 12, 31),
    );
  });

  bench('serialize to JSON', () => {
    timeline.toJSON();
  });
});
