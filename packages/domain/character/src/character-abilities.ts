import { ValueObject } from '@storynaram/domain-kernel';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export class CharacterAbilities extends ValueObject {
  public readonly strength: number;
  public readonly dexterity: number;
  public readonly constitution: number;
  public readonly intelligence: number;
  public readonly wisdom: number;
  public readonly charisma: number;

  constructor(scores: Partial<AbilityScores> = {}) {
    super();
    this.strength = scores.strength ?? 10;
    this.dexterity = scores.dexterity ?? 10;
    this.constitution = scores.constitution ?? 10;
    this.intelligence = scores.intelligence ?? 10;
    this.wisdom = scores.wisdom ?? 10;
    this.charisma = scores.charisma ?? 10;
  }

  getModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  get strengthModifier(): number { return this.getModifier(this.strength); }
  get dexterityModifier(): number { return this.getModifier(this.dexterity); }
  get constitutionModifier(): number { return this.getModifier(this.constitution); }
  get intelligenceModifier(): number { return this.getModifier(this.intelligence); }
  get wisdomModifier(): number { return this.getModifier(this.wisdom); }
  get charismaModifier(): number { return this.getModifier(this.charisma); }

  withStrength(value: number): CharacterAbilities {
    return new CharacterAbilities({ ...this, strength: value });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.strength, this.dexterity, this.constitution, this.intelligence, this.wisdom, this.charisma];
  }

  toJSON(): Record<string, unknown> {
    return {
      strength: this.strength,
      dexterity: this.dexterity,
      constitution: this.constitution,
      intelligence: this.intelligence,
      wisdom: this.wisdom,
      charisma: this.charisma,
    };
  }
}
