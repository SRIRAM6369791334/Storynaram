import { ValueObject } from '@storynaram/domain-kernel';

export class TimelineDate extends ValueObject {
  constructor(
    public readonly year: number,
    public readonly month: number,
    public readonly day: number,
    public readonly era: string = 'CE',
  ) {
    super();
    if (year < -9999 || year > 9999) throw new Error(`Year out of range: ${year}`);
    if (month < 1 || month > 12) throw new Error(`Invalid month: ${month}`);
    if (day < 1 || day > 31) throw new Error(`Invalid day: ${day}`);
  }

  compareTo(other: TimelineDate): number {
    const yearDiff = this.year - other.year;
    if (yearDiff !== 0) return yearDiff;
    const monthDiff = this.month - other.month;
    if (monthDiff !== 0) return monthDiff;
    return this.day - other.day;
  }

  isBefore(other: TimelineDate): boolean {
    return this.compareTo(other) < 0;
  }

  isAfter(other: TimelineDate): boolean {
    return this.compareTo(other) > 0;
  }

  isEqual(other: TimelineDate): boolean {
    return this.compareTo(other) === 0;
  }

  addDays(days: number): TimelineDate {
    let newDay = this.day + days;
    let newMonth = this.month;
    let newYear = this.year;
    while (newDay > 31) { newDay -= 31; newMonth++; }
    while (newMonth > 12) { newMonth -= 12; newYear++; }
    while (newDay < 1) { newDay += 31; newMonth--; }
    while (newMonth < 1) { newMonth += 12; newYear--; }
    return new TimelineDate(newYear, newMonth, newDay, this.era);
  }

  toEra(era: string): TimelineDate {
    return new TimelineDate(this.year, this.month, this.day, era);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.year, this.month, this.day, this.era];
  }

  toJSON(): Record<string, unknown> {
    return { year: this.year, month: this.month, day: this.day, era: this.era };
  }
}

export class TimelineClock extends ValueObject {
  constructor(
    public readonly hours: number,
    public readonly minutes: number,
    public readonly seconds: number,
  ) {
    super();
    if (hours < 0 || hours > 23) throw new Error(`Invalid hours: ${hours}`);
    if (minutes < 0 || minutes > 59) throw new Error(`Invalid minutes: ${minutes}`);
    if (seconds < 0 || seconds > 59) throw new Error(`Invalid seconds: ${seconds}`);
  }

  get totalSeconds(): number {
    return this.hours * 3600 + this.minutes * 60 + this.seconds;
  }

  isBefore(other: TimelineClock): boolean {
    return this.totalSeconds < other.totalSeconds;
  }

  isAfter(other: TimelineClock): boolean {
    return this.totalSeconds > other.totalSeconds;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.hours, this.minutes, this.seconds];
  }

  toJSON(): Record<string, unknown> {
    return { hours: this.hours, minutes: this.minutes, seconds: this.seconds };
  }
}

export class TimelineDuration extends ValueObject {
  constructor(
    public readonly years: number,
    public readonly months: number,
    public readonly days: number,
  ) {
    super();
    if (years < 0) throw new Error(`Years cannot be negative: ${years}`);
    if (months < 0 || months > 11) throw new Error(`Invalid months: ${months}`);
    if (days < 0 || days > 30) throw new Error(`Invalid days: ${days}`);
  }

  get totalDays(): number {
    return this.years * 365 + this.months * 30 + this.days;
  }

  static zero(): TimelineDuration {
    return new TimelineDuration(0, 0, 0);
  }

  isZero(): boolean {
    return this.years === 0 && this.months === 0 && this.days === 0;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.years, this.months, this.days];
  }

  toJSON(): Record<string, unknown> {
    return { years: this.years, months: this.months, days: this.days };
  }
}

export class TimelinePeriod extends ValueObject {
  constructor(
    public readonly start: TimelineDate,
    public readonly end: TimelineDate,
  ) {
    super();
    if (!start.isBefore(end) && !start.isEqual(end)) {
      throw new Error('Period start must be before or equal to end');
    }
  }

  get duration(): TimelineDuration {
    const yearDiff = this.end.year - this.start.year;
    const monthDiff = this.end.month - this.start.month;
    const dayDiff = this.end.day - this.start.day;
    return new TimelineDuration(yearDiff, monthDiff < 0 ? monthDiff + 12 : monthDiff, dayDiff < 0 ? dayDiff + 30 : dayDiff);
  }

  contains(date: TimelineDate): boolean {
    return (date.isAfter(this.start) || date.isEqual(this.start)) &&
           (date.isBefore(this.end) || date.isEqual(this.end));
  }

  overlapsWith(other: TimelinePeriod): boolean {
    return this.contains(other.start) || this.contains(other.end) || other.contains(this.start);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.start, this.end];
  }

  toJSON(): Record<string, unknown> {
    return { start: this.start.toJSON(), end: this.end.toJSON() };
  }
}
