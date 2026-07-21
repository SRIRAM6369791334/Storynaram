import { describe, it, expect } from 'vitest';
import { TimelineDate, TimelineClock, TimelineDuration, TimelinePeriod } from '../src/timeline-date';
import { TimelineCalendar } from '../src/timeline-calendar';
import { TimelineEventId } from '../src/timeline-event-id';
import { TimelineIdentity } from '../src/timeline-identity';

describe('TimelineIdentity', () => {
  it('creates with value', () => {
    const id = new TimelineIdentity('timeline-1');
    expect(id.value).toBe('timeline-1');
  });

  it('creates with random UUID', () => {
    const id = TimelineIdentity.create();
    expect(id.value).toBeDefined();
  });
});

describe('TimelineEventId', () => {
  it('creates with value', () => {
    const id = new TimelineEventId('evt-1');
    expect(id.value).toBe('evt-1');
  });

  it('creates with random UUID', () => {
    const id = TimelineEventId.create();
    expect(id.value).toBeDefined();
  });
});

describe('TimelineDate', () => {
  it('creates with valid date', () => {
    const d = new TimelineDate(2024, 6, 15);
    expect(d.year).toBe(2024);
    expect(d.month).toBe(6);
    expect(d.day).toBe(15);
  });

  it('throws on invalid year', () => {
    expect(() => new TimelineDate(10000, 1, 1)).toThrow();
    expect(() => new TimelineDate(-10000, 1, 1)).toThrow();
  });

  it('throws on invalid month', () => {
    expect(() => new TimelineDate(2024, 0, 1)).toThrow();
    expect(() => new TimelineDate(2024, 13, 1)).toThrow();
  });

  it('throws on invalid day', () => {
    expect(() => new TimelineDate(2024, 1, 0)).toThrow();
    expect(() => new TimelineDate(2024, 1, 32)).toThrow();
  });

  it('compares dates correctly', () => {
    const a = new TimelineDate(2024, 1, 1);
    const b = new TimelineDate(2024, 6, 15);
    const c = new TimelineDate(2024, 1, 1);
    expect(a.isBefore(b)).toBe(true);
    expect(b.isAfter(a)).toBe(true);
    expect(a.isEqual(c)).toBe(true);
    expect(a.compareTo(b)).toBeLessThan(0);
  });

  it('adds days', () => {
    const d = new TimelineDate(2024, 1, 1);
    const later = d.addDays(15);
    expect(later.day).toBe(16);
    expect(later.month).toBe(1);
  });

  it('wraps month on addDays overflow', () => {
    const d = new TimelineDate(2024, 1, 25);
    const later = d.addDays(10);
    expect(later.month).toBe(2);
    expect(later.day).toBe(4);
  });

  it('changes era', () => {
    const d = new TimelineDate(2024, 1, 1, 'CE');
    const bf = d.toEra('BF');
    expect(bf.era).toBe('BF');
  });
});

describe('TimelineClock', () => {
  it('creates with valid time', () => {
    const c = new TimelineClock(14, 30, 0);
    expect(c.hours).toBe(14);
    expect(c.totalSeconds).toBe(52200);
  });

  it('throws on invalid hours', () => {
    expect(() => new TimelineClock(24, 0, 0)).toThrow();
  });

  it('throws on invalid minutes', () => {
    expect(() => new TimelineClock(12, 60, 0)).toThrow();
  });

  it('compares clocks', () => {
    const a = new TimelineClock(10, 0, 0);
    const b = new TimelineClock(12, 0, 0);
    expect(a.isBefore(b)).toBe(true);
    expect(b.isAfter(a)).toBe(true);
  });
});

describe('TimelineDuration', () => {
  it('creates with valid values', () => {
    const d = new TimelineDuration(1, 6, 15);
    expect(d.totalDays).toBe(1 * 365 + 6 * 30 + 15);
  });

  it('throws on negative years', () => {
    expect(() => new TimelineDuration(-1, 0, 0)).toThrow();
  });

  it('throws on invalid months', () => {
    expect(() => new TimelineDuration(1, 12, 0)).toThrow();
  });

  it('zero returns true for isZero', () => {
    expect(TimelineDuration.zero().isZero()).toBe(true);
  });
});

describe('TimelinePeriod', () => {
  it('creates with valid start/end', () => {
    const start = new TimelineDate(2024, 1, 1);
    const end = new TimelineDate(2024, 12, 31);
    const p = new TimelinePeriod(start, end);
    expect(p.start.isEqual(start)).toBe(true);
  });

  it('throws when start after end', () => {
    expect(() => new TimelinePeriod(
      new TimelineDate(2024, 12, 31),
      new TimelineDate(2024, 1, 1),
    )).toThrow();
  });

  it('contains date', () => {
    const p = new TimelinePeriod(
      new TimelineDate(2024, 1, 1),
      new TimelineDate(2024, 12, 31),
    );
    expect(p.contains(new TimelineDate(2024, 6, 15))).toBe(true);
    expect(p.contains(new TimelineDate(2023, 12, 31))).toBe(false);
  });

  it('detects overlap', () => {
    const a = new TimelinePeriod(
      new TimelineDate(2024, 1, 1),
      new TimelineDate(2024, 6, 30),
    );
    const b = new TimelinePeriod(
      new TimelineDate(2024, 6, 1),
      new TimelineDate(2024, 12, 31),
    );
    expect(a.overlapsWith(b)).toBe(true);
  });
});

describe('TimelineCalendar', () => {
  it('creates standard calendar', () => {
    const cal = TimelineCalendar.standard();
    expect(cal.months).toHaveLength(12);
    expect(cal.totalDaysInYear).toBe(365);
  });

  it('throws on empty months', () => {
    expect(() => new TimelineCalendar([], 7, 'CE')).toThrow();
  });
});
