import { bench, describe } from 'vitest';
import { TimelineFactory } from '../src/timeline-factory';

describe('TimelineFactory benchmarks', () => {
  const factory = new TimelineFactory();

  bench('create basic timeline', () => {
    factory.create({ name: 'Bench', description: 'Benchmark' });
  });

  bench('create with 50 events', () => {
    factory.create({
      name: 'Bench',
      initialEvents: Array.from({ length: 50 }, (_, i) => ({
        title: `Event ${i}`,
        description: '',
        year: 2024,
        month: 1,
        day: i + 1,
        eventType: 'historical' as const,
        importance: 50,
      })),
    });
  });

  bench('reconstitute from state', () => {
    factory.reconstitute({ identity: 'bench', name: 'Bench', description: '' });
  });
});
