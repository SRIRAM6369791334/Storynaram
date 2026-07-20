import { describe, it, expect } from 'vitest';
import { WorldName, WorldDescription } from '../src/world-profile';
import { Coordinates, Area, Population, Biome, Climate, Temperature, Elevation } from '../src/world-geography';
import { LanguageCode, CurrencyCode } from '../src/world-culture';
import { Calendar, TimeSystem } from '../src/world-calendar';
import { PoliticalSystem } from '../src/world-political';

describe('WorldName', () => {
  it('creates with valid name', () => {
    const name = new WorldName('Middle Earth');
    expect(name.value).toBe('Middle Earth');
  });

  it('throws on empty name', () => {
    expect(() => new WorldName('')).toThrow();
  });

  it('equals same value', () => {
    const a = new WorldName('Arda');
    const b = new WorldName('Arda');
    expect(a.equals(b)).toBe(true);
  });

  it('not equals different name', () => {
    const a = new WorldName('Arda');
    const b = new WorldName('Middle Earth');
    expect(a.equals(b)).toBe(false);
  });
});

describe('Coordinates', () => {
  it('creates with valid coordinates', () => {
    const c = new Coordinates(45.5, -73.5);
    expect(c.latitude).toBe(45.5);
    expect(c.longitude).toBe(-73.5);
  });

  it('throws on invalid latitude', () => {
    expect(() => new Coordinates(100, 0)).toThrow();
    expect(() => new Coordinates(-100, 0)).toThrow();
  });

  it('throws on invalid longitude', () => {
    expect(() => new Coordinates(0, 200)).toThrow();
    expect(() => new Coordinates(0, -200)).toThrow();
  });

  it('calculates distance', () => {
    const a = new Coordinates(0, 0);
    const b = new Coordinates(0, 1);
    const dist = a.distanceTo(b);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(200);
  });
});

describe('Area', () => {
  it('creates with valid area', () => {
    const area = new Area(1000);
    expect(area.value).toBe(1000);
  });

  it('throws on negative area', () => {
    expect(() => new Area(-1)).toThrow();
  });
});

describe('Population', () => {
  it('creates with valid population', () => {
    const pop = new Population(1000000);
    expect(pop.value).toBe(1000000);
  });

  it('throws on negative population', () => {
    expect(() => new Population(-1)).toThrow();
  });
});

describe('Biome', () => {
  it('creates with valid biome', () => {
    const b = new Biome('forest');
    expect(b.value).toBe('forest');
  });

  it('throws on empty biome', () => {
    expect(() => new Biome('')).toThrow();
  });
});

describe('Climate', () => {
  it('creates with valid climate', () => {
    const c = new Climate('temperate');
    expect(c.value).toBe('temperate');
  });

  it('throws on empty climate', () => {
    expect(() => new Climate('')).toThrow();
  });
});

describe('Temperature', () => {
  it('creates with value', () => {
    const t = new Temperature(25);
    expect(t.value).toBe(25);
  });

  it('detects freezing', () => {
    expect(new Temperature(-5).isFreezing).toBe(true);
    expect(new Temperature(10).isFreezing).toBe(false);
  });

  it('detects boiling', () => {
    expect(new Temperature(100).isBoiling).toBe(true);
    expect(new Temperature(50).isBoiling).toBe(false);
  });
});

describe('Elevation', () => {
  it('creates with value', () => {
    const e = new Elevation(1000);
    expect(e.value).toBe(1000);
  });

  it('allows negative elevation', () => {
    const e = new Elevation(-100);
    expect(e.value).toBe(-100);
  });
});

describe('LanguageCode', () => {
  it('creates with code', () => {
    const lc = new LanguageCode('en');
    expect(lc.value).toBe('en');
  });

  it('throws on empty code', () => {
    expect(() => new LanguageCode('')).toThrow();
  });
});

describe('CurrencyCode', () => {
  it('creates with code', () => {
    const cc = new CurrencyCode('GOLD');
    expect(cc.value).toBe('GOLD');
  });

  it('throws on empty code', () => {
    expect(() => new CurrencyCode('')).toThrow();
  });
});

describe('PoliticalSystem', () => {
  it('creates with type', () => {
    const ps = new PoliticalSystem('monarchy', 'Ruled by a king');
    expect(ps.type).toBe('monarchy');
  });
});

describe('Calendar', () => {
  it('creates with valid months', () => {
    const cal = new Calendar(
      [{ name: 'January', days: 31 }, { name: 'February', days: 28 }],
      7,
      { year: 1, month: 1, day: 1 },
      'Third Age',
    );
    expect(cal.totalDaysInYear).toBe(59);
  });

  it('throws on empty months', () => {
    expect(() => new Calendar([], 7, { year: 1, month: 1, day: 1 }, 'Era')).toThrow();
  });

  it('throws on invalid month', () => {
    expect(() => new Calendar([{ name: 'Jan', days: 31 }], 7, { year: 1, month: 2, day: 1 }, 'Era')).toThrow();
  });

  it('throws on invalid day', () => {
    expect(() => new Calendar([{ name: 'Jan', days: 31 }], 7, { year: 1, month: 1, day: 32 }, 'Era')).toThrow();
  });

  it('advances day within month', () => {
    const cal = new Calendar([{ name: 'Jan', days: 31 }], 7, { year: 1, month: 1, day: 1 }, 'Era');
    const next = cal.advanceDay();
    expect(next.currentDate.day).toBe(2);
  });

  it('advances month at end of month', () => {
    const cal = new Calendar(
      [{ name: 'Jan', days: 31 }, { name: 'Feb', days: 28 }],
      7,
      { year: 1, month: 1, day: 31 },
      'Era',
    );
    const next = cal.advanceDay();
    expect(next.currentDate.month).toBe(2);
    expect(next.currentDate.day).toBe(1);
  });

  it('advances year at end of year', () => {
    const cal = new Calendar([{ name: 'Jan', days: 31 }], 7, { year: 1, month: 1, day: 31 }, 'Era');
    const next = cal.advanceDay();
    expect(next.currentDate.year).toBe(2);
    expect(next.currentDate.month).toBe(1);
    expect(next.currentDate.day).toBe(1);
  });
});

describe('TimeSystem', () => {
  it('creates with defaults', () => {
    const ts = new TimeSystem(24, 60, 60, ['Monday', 'Tuesday']);
    expect(ts.hoursInDay).toBe(24);
    expect(ts.totalSecondsInDay).toBe(86400);
  });

  it('throws on invalid hours', () => {
    expect(() => new TimeSystem(0, 60, 60, ['Monday'])).toThrow();
  });

  it('throws on empty day names', () => {
    expect(() => new TimeSystem(24, 60, 60, [])).toThrow();
  });
});
