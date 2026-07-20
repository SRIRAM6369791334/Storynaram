import { ValueObject } from '@storynaram/domain-kernel';

export interface MonthDefinition {
  name: string;
  days: number;
}

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export class Calendar extends ValueObject {
  constructor(
    public readonly months: readonly MonthDefinition[],
    public readonly daysInWeek: number,
    public readonly currentDate: CalendarDate,
    public readonly era: string,
  ) {
    super();
    if (months.length === 0) throw new Error('Calendar must have at least one month');
    if (daysInWeek < 1) throw new Error('Days in week must be at least 1');
    if (currentDate.year < 1) throw new Error('Year must be at least 1');
    if (currentDate.month < 1 || currentDate.month > months.length) throw new Error(`Invalid month: ${currentDate.month}`);
    const monthDef = months[currentDate.month - 1];
    if (!monthDef) throw new Error(`Month definition not found: ${currentDate.month}`);
    if (currentDate.day < 1 || currentDate.day > monthDef.days) throw new Error(`Invalid day: ${currentDate.day} for month ${monthDef.name}`);
  }

  get totalDaysInYear(): number {
    return this.months.reduce((sum, m) => sum + m.days, 0);
  }

  advanceDay(): Calendar {
    const m = this.months[this.currentDate.month - 1];
    if (!m) return this;
    if (this.currentDate.day < m.days) {
      return new Calendar(this.months, this.daysInWeek, { ...this.currentDate, day: this.currentDate.day + 1 }, this.era);
    }
    if (this.currentDate.month < this.months.length) {
      return new Calendar(this.months, this.daysInWeek, { year: this.currentDate.year, month: this.currentDate.month + 1, day: 1 }, this.era);
    }
    return new Calendar(this.months, this.daysInWeek, { year: this.currentDate.year + 1, month: 1, day: 1 }, this.era);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.months.length, this.daysInWeek, this.currentDate.year, this.currentDate.month, this.currentDate.day, this.era];
  }

  toJSON(): Record<string, unknown> {
    return {
      months: this.months.map(m => ({ name: m.name, days: m.days })),
      daysInWeek: this.daysInWeek,
      currentDate: this.currentDate,
      era: this.era,
    };
  }
}

export class TimeSystem extends ValueObject {
  constructor(
    public readonly hoursInDay: number,
    public readonly minutesInHour: number,
    public readonly secondsInMinute: number,
    public readonly dayNames: readonly string[],
  ) {
    super();
    if (hoursInDay < 1) throw new Error('Hours in day must be at least 1');
    if (minutesInHour < 1) throw new Error('Minutes in hour must be at least 1');
    if (secondsInMinute < 1) throw new Error('Seconds in minute must be at least 1');
    if (dayNames.length < 1) throw new Error('At least one day name is required');
  }

  get totalSecondsInDay(): number {
    return this.hoursInDay * this.minutesInHour * this.secondsInMinute;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.hoursInDay, this.minutesInHour, this.secondsInMinute, ...this.dayNames];
  }

  toJSON(): Record<string, unknown> {
    return {
      hoursInDay: this.hoursInDay,
      minutesInHour: this.minutesInHour,
      secondsInMinute: this.secondsInMinute,
      dayNames: [...this.dayNames],
    };
  }
}
