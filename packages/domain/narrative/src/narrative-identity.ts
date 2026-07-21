import { Identity } from '@storynaram/domain-kernel';

export class NarrativeIdentity extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): NarrativeIdentity {
    return new NarrativeIdentity(value ?? crypto.randomUUID());
  }
}
