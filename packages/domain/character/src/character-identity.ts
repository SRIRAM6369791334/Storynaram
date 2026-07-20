import { Identity } from '@storynaram/domain-kernel';

export class CharacterIdentity extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): CharacterIdentity {
    return new CharacterIdentity(value ?? crypto.randomUUID());
  }
}
