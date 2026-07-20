import { ValueObject } from '@storynaram/domain-kernel';

export type MagicType = 'arcane' | 'divine' | 'nature' | 'elemental' | 'necromantic' | 'psionic' | 'runic' | 'bardic' | 'ritual';

export class MagicSystem extends ValueObject {
  constructor(
    public readonly name: string,
    public readonly type: MagicType,
    public readonly powerLevel: number,
    public readonly description: string,
    public readonly rules: string[],
  ) {
    super();
    if (name.trim().length === 0) throw new Error('Magic system name cannot be empty');
    if (powerLevel < 0 || powerLevel > 100) throw new Error(`Power level must be between 0 and 100: ${powerLevel}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.name.toLowerCase(), this.type, this.powerLevel, this.description, ...this.rules];
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      powerLevel: this.powerLevel,
      description: this.description,
      rules: this.rules,
    };
  }
}
