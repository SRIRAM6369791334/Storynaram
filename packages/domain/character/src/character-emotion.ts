import { ValueObject } from '@storynaram/domain-kernel';

export enum PrimaryEmotion {
  JOY = 'JOY',
  SADNESS = 'SADNESS',
  ANGER = 'ANGER',
  FEAR = 'FEAR',
  SURPRISE = 'SURPRISE',
  DISGUST = 'DISGUST',
  LOVE = 'LOVE',
  TRUST = 'TRUST',
  ANTICIPATION = 'ANTICIPATION',
}

export class CharacterEmotion extends ValueObject {
  constructor(
    public readonly primary: PrimaryEmotion,
    public readonly intensity: number = 0.5,
    public readonly secondary?: PrimaryEmotion,
  ) {
    super();
    if (intensity < 0 || intensity > 1) {
      throw new Error(`Emotion intensity must be between 0 and 1: ${intensity}`);
    }
  }

  get label(): string {
    return this.secondary
      ? `${this.primary} (${this.secondary})`
      : this.primary;
  }

  isIntense(): boolean {
    return this.intensity > 0.7;
  }

  isCalm(): boolean {
    return this.intensity < 0.3;
  }

  withIntensity(intensity: number): CharacterEmotion {
    return new CharacterEmotion(this.primary, intensity, this.secondary);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.primary, this.intensity, this.secondary];
  }

  toJSON(): Record<string, unknown> {
    return {
      primary: this.primary,
      intensity: this.intensity,
      secondary: this.secondary,
    };
  }
}
