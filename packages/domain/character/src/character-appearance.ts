import { ValueObject } from '@storynaram/domain-kernel';

export interface CharacterAppearanceProps {
  height?: number;
  weight?: number;
  hairColor?: string;
  eyeColor?: string;
  skinColor?: string;
  distinguishingFeatures?: string[];
}

export class CharacterAppearance extends ValueObject {
  public readonly height: number;
  public readonly weight: number;
  public readonly hairColor: string;
  public readonly eyeColor: string;
  public readonly skinColor: string;
  public readonly distinguishingFeatures: readonly string[];

  constructor(props: CharacterAppearanceProps = {}) {
    super();
    this.height = props.height ?? 0;
    this.weight = props.weight ?? 0;
    this.hairColor = props.hairColor ?? '';
    this.eyeColor = props.eyeColor ?? '';
    this.skinColor = props.skinColor ?? '';
    this.distinguishingFeatures = Object.freeze([...(props.distinguishingFeatures ?? [])]);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.height, this.weight, this.hairColor, this.eyeColor, this.skinColor, ...this.distinguishingFeatures];
  }

  toJSON(): Record<string, unknown> {
    return {
      height: this.height,
      weight: this.weight,
      hairColor: this.hairColor,
      eyeColor: this.eyeColor,
      skinColor: this.skinColor,
      distinguishingFeatures: [...this.distinguishingFeatures],
    };
  }
}
