import { describe, it, expect } from 'vitest';
import { TimelineFactory } from '../src/timeline-factory';
import { FactoryError } from '@storynaram/domain-kernel';

const factory = new TimelineFactory();

describe('TimelineFactory', () => {
  it('creates a timeline with required props', () => {
    const timeline = factory.create({
      name: 'Main Timeline',
      description: 'Primary narrative timeline',
    });
    expect(timeline.identity).toBeDefined();
    expect(timeline.name).toBe('Main Timeline');
    expect(timeline.branches.count).toBe(1);
  });

  it('rejects empty name', () => {
    expect(() => factory.create({ name: '' })).toThrow(FactoryError);
  });

  it('uses provided identity', () => {
    const timeline = factory.create({
      identity: 'my-timeline',
      name: 'Named',
    });
    expect(timeline.identity.value).toBe('my-timeline');
  });

  it('creates with initial events', () => {
    const timeline = factory.create({
      name: 'Events Timeline',
      initialEvents: [
        {
          title: 'First Event',
          description: 'The beginning',
          year: 2024,
          month: 1,
          day: 1,
          eventType: 'historical',
          importance: 90,
        },
        {
          title: 'Second Event',
          description: 'The middle',
          year: 2024,
          month: 6,
          day: 15,
          eventType: 'character',
          importance: 50,
        },
      ],
    });
    expect(timeline.events.count).toBe(2);
  });

  it('rejects invalid event dates', () => {
    expect(() => factory.create({
      name: 'Bad Timeline',
      initialEvents: [
        {
          title: 'Bad Event',
          description: '',
          year: -10000,
          month: 1,
          day: 1,
          eventType: 'historical',
        },
      ],
    })).toThrow();
  });

  it('reconstitutes from state', () => {
    const timeline = factory.reconstitute({
      identity: 'recon-timeline',
      name: 'Reconstituted',
      description: 'Rebuilt from state',
    });
    expect(timeline.identity.value).toBe('recon-timeline');
    expect(timeline.name).toBe('Reconstituted');
  });
});
