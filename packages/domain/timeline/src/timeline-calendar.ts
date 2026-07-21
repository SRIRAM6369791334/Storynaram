import { ValueObject } from '@storynaram/domain-kernel';

export interface MonthDefinition {
  name: string;
  days: number;
}

export class TimelineCalendar extends ValueObject {
  constructor(
    public readonly months: readonly MonthDefinition[],
    public readonly daysInWeek: number,
    public readonly epoch: string,
  ) {
    super();
    if (months.length === 0) throw new Error('Calendar must have at least one month');
    if (daysInWeek < 1) throw new Error('Days in week must be at least 1');
    if (epoch.trim().length === 0) throw new Error('Epoch cannot be empty');
  }

  get totalDaysInYear(): number {
    return this.months.reduce((sum, m) => sum + m.days, 0);
  }

  static standard(): TimelineCalendar {
    return new TimelineCalendar(
      [
        { name: 'January', days: 31 },
        { name: 'February', days: 28 },
        { name: 'March', days: 31 },
        { name: 'April', days: 30 },
        { name: 'May', days: 31 },
        { name: 'June', days: 30 },
        { name: 'July', days: 31 },
        { name: 'August', days: 31 },
        { name: 'September', days: 30 },
        { name: 'October', days: 31 },
        { name: 'November', days: 30 },
        { name: 'December', days: 31 },
      ],
      7,
      'CE',
    );
  }

  protected getEqualityComponents(): unknown[] {
    return [this.months.length, this.daysInWeek, this.epoch];
  }

  toJSON(): Record<string, unknown> {
    return {
      months: this.months.map(m => ({ name: m.name, days: m.days })),
      daysInWeek: this.daysInWeek,
      epoch: this.epoch,
    };
  }
}
