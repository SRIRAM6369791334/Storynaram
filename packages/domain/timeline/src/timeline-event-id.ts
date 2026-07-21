import { Identity } from '@storynaram/domain-kernel';

export class TimelineEventId extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): TimelineEventId {
    return new TimelineEventId(value ?? crypto.randomUUID());
  }
}
