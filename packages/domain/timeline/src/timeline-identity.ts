import { Identity } from '@storynaram/domain-kernel';

export class TimelineIdentity extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): TimelineIdentity {
    return new TimelineIdentity(value ?? crypto.randomUUID());
  }
}
