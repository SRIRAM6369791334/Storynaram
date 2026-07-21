import { Identity } from '@storynaram/domain-kernel';

export class StoryIdentity extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): StoryIdentity {
    return new StoryIdentity(value ?? crypto.randomUUID());
  }
}
