import { Identity } from '@storynaram/domain-kernel';

export class WorldIdentity extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): WorldIdentity {
    return new WorldIdentity(value ?? crypto.randomUUID());
  }
}
