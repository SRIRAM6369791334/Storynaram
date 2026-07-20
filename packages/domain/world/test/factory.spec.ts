import { describe, it, expect } from 'vitest';
import { WorldFactory } from '../src/world-factory';
import { FactoryError, BusinessRuleError } from '@storynaram/domain-kernel';

const factory = new WorldFactory();

describe('WorldFactory', () => {
  it('creates a world with required props', () => {
    const world = factory.create({
      profile: {
        name: 'Arda',
        description: 'The world created by Eru Ilúvatar',
        genre: 'fantasy',
        tone: 'epic',
      },
    });
    expect(world.identity).toBeDefined();
    expect(world.profile.name.value).toBe('Arda');
    expect(world.profile.genre).toBe('fantasy');
  });

  it('creates with geography', () => {
    const world = factory.create({
      profile: {
        name: 'Middle Earth',
        description: 'Continent of Arda',
        genre: 'fantasy',
        tone: 'dark',
      },
      geography: {
        totalArea: 10000000,
        totalPopulation: 1000000,
        terrain: 'mountains and forests',
        primaryClimate: 'temperate',
        primaryBiome: 'mixed',
      },
    });
    expect(world.geography.totalArea.value).toBe(10000000);
    expect(world.geography.terrain).toBe('mountains and forests');
  });

  it('creates with calendar', () => {
    const world = factory.create({
      profile: {
        name: 'Test World',
        description: 'Calendar test',
        genre: 'fantasy',
        tone: 'neutral',
      },
      calendar: {
        months: [
          { name: 'January', days: 31 },
          { name: 'February', days: 28 },
        ],
        daysInWeek: 7,
        currentYear: 3018,
        currentMonth: 1,
        currentDay: 1,
        era: 'Third Age',
      },
    });
    expect(world.calendar.totalDaysInYear).toBe(59);
    expect(world.calendar.currentDate.year).toBe(3018);
  });

  it('creates with time system', () => {
    const world = factory.create({
      profile: {
        name: 'Test World',
        description: 'Time test',
        genre: 'fantasy',
        tone: 'neutral',
      },
      timeSystem: {
        hoursInDay: 24,
        minutesInHour: 60,
        secondsInMinute: 60,
        dayNames: ['Monday', 'Tuesday', 'Wednesday'],
      },
    });
    expect(world.timeSystem.totalSecondsInDay).toBe(86400);
  });

  it('uses provided identity', () => {
    const world = factory.create({
      identity: 'my-world-1',
      profile: {
        name: 'Named World',
        description: 'Specific ID',
        genre: 'fantasy',
        tone: 'light',
      },
    });
    expect(world.identity.value).toBe('my-world-1');
  });

  it('rejects empty name', () => {
    expect(() => factory.create({
      profile: {
        name: '',
        description: 'Empty name',
        genre: 'fantasy',
        tone: 'dark',
      },
    })).toThrow(FactoryError);
  });

  it('rejects invalid world name if duplicate', () => {
    expect(() => factory.create({
      profile: {
        name: 'Duplicate',
        description: 'Test',
        genre: 'fantasy',
        tone: 'dark',
      },
      existingWorldNames: new Set(['duplicate']),
    })).toThrow(BusinessRuleError);
  });

  it('reconstitutes from state', () => {
    const state = {
      identity: 'recon-world',
      profile: {
        name: { value: 'Recon World' },
        description: { value: 'Reconstituted' },
        genre: 'fantasy',
        tone: 'epic',
      },
    };
    const world = factory.reconstitute(state);
    expect(world.identity.value).toBe('recon-world');
    expect(world.profile.name.value).toBe('Recon World');
  });
});
