import { Identity } from '@storynaram/domain-kernel';

export class CanonIdentity extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): CanonIdentity {
    return new CanonIdentity(value ?? crypto.randomUUID());
  }
}
