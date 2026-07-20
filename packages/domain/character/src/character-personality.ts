import { ValueObject } from '@storynaram/domain-kernel';

export class CharacterTraits extends ValueObject {
  public readonly values: readonly string[];

  constructor(traits: string[]) {
    super();
    this.values = Object.freeze([...traits]);
  }

  has(trait: string): boolean {
    return this.values.includes(trait);
  }

  protected getEqualityComponents(): unknown[] {
    return [...this.values];
  }

  toJSON(): Record<string, unknown> {
    return { values: [...this.values] };
  }
}

export class CharacterAlignment extends ValueObject {
  constructor(
    public readonly moral: 'good' | 'neutral' | 'evil',
    public readonly ethical: 'lawful' | 'neutral' | 'chaotic',
  ) {
    super();
  }

  get label(): string {
    return `${this.ethical} ${this.moral}`;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.moral, this.ethical];
  }

  toJSON(): Record<string, unknown> {
    return { moral: this.moral, ethical: this.ethical, label: this.label };
  }

  static lawfulGood(): CharacterAlignment { return new CharacterAlignment('good', 'lawful'); }
  static neutralGood(): CharacterAlignment { return new CharacterAlignment('good', 'neutral'); }
  static chaoticGood(): CharacterAlignment { return new CharacterAlignment('good', 'chaotic'); }
  static lawfulNeutral(): CharacterAlignment { return new CharacterAlignment('neutral', 'lawful'); }
  static trueNeutral(): CharacterAlignment { return new CharacterAlignment('neutral', 'neutral'); }
  static chaoticNeutral(): CharacterAlignment { return new CharacterAlignment('neutral', 'chaotic'); }
  static lawfulEvil(): CharacterAlignment { return new CharacterAlignment('evil', 'lawful'); }
  static neutralEvil(): CharacterAlignment { return new CharacterAlignment('evil', 'neutral'); }
  static chaoticEvil(): CharacterAlignment { return new CharacterAlignment('evil', 'chaotic'); }
}

export interface CharacterPersonalityProps {
  traits?: CharacterTraits;
  alignment?: CharacterAlignment;
}

export class CharacterPersonality extends ValueObject {
  public readonly traits: CharacterTraits;
  public readonly alignment: CharacterAlignment;

  constructor(props: CharacterPersonalityProps = {}) {
    super();
    this.traits = props.traits ?? new CharacterTraits([]);
    this.alignment = props.alignment ?? CharacterAlignment.trueNeutral();
  }

  withTraits(traits: CharacterTraits): CharacterPersonality {
    return new CharacterPersonality({ ...this, traits });
  }

  withAlignment(alignment: CharacterAlignment): CharacterPersonality {
    return new CharacterPersonality({ ...this, alignment });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.traits, this.alignment];
  }

  toJSON(): Record<string, unknown> {
    return {
      traits: this.traits.toJSON(),
      alignment: this.alignment.toJSON(),
    };
  }
}
