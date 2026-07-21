import { bench, describe } from 'vitest';
import { TimelineDate, TimelineDuration, TimelinePeriod } from '../src/timeline-date';

describe('TimelineDate benchmarks', () => {
  const dates: TimelineDate[] = [];
  for (let i = 0; i < 1000; i++) {
    dates.push(new TimelineDate(2024, 1, (i % 28) + 1));
  }

  bench('date creation', () => {
    new TimelineDate(2024, 6, 15);
  });

  bench('isBefore comparison', () => {
    let count = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i]!.isBefore(dates[i + 1]!)) count++;
    }
  });

  bench('duration creation', () => {
    new TimelineDuration(1, 6, 15);
  });

  bench('period overlap check', () => {
    const periods = dates.slice(0, -1).map((d, i) =>
      new TimelinePeriod(d, dates[i + 1]!)
    );
    for (let i = 0; i < periods.length - 1; i++) {
      periods[i]!.overlapsWith(periods[i + 1]!);
    }
  });
});
