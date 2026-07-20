import { ValueObject } from '@storynaram/domain-kernel';

export interface CharacterStatisticsProps {
  level?: number;
  experiencePoints?: number;
  health?: number;
  maxHealth?: number;
  mana?: number;
  maxMana?: number;
  stamina?: number;
  maxStamina?: number;
}

export class CharacterStatistics extends ValueObject {
  public readonly level: number;
  public readonly experiencePoints: number;
  public readonly health: number;
  public readonly maxHealth: number;
  public readonly mana: number;
  public readonly maxMana: number;
  public readonly stamina: number;
  public readonly maxStamina: number;

  constructor(props: CharacterStatisticsProps = {}) {
    super();
    this.level = props.level ?? 1;
    this.experiencePoints = props.experiencePoints ?? 0;
    this.maxHealth = props.maxHealth ?? 100;
    this.health = props.health ?? this.maxHealth;
    this.maxMana = props.maxMana ?? 50;
    this.mana = props.mana ?? this.maxMana;
    this.maxStamina = props.maxStamina ?? 100;
    this.stamina = props.stamina ?? this.maxStamina;

    if (this.level < 1) throw new Error(`Level must be at least 1: ${this.level}`);
    if (this.health < 0) throw new Error(`Health cannot be negative: ${this.health}`);
    if (this.mana < 0) throw new Error(`Mana cannot be negative: ${this.mana}`);
    if (this.stamina < 0) throw new Error(`Stamina cannot be negative: ${this.stamina}`);
  }

  get isFullHealth(): boolean { return this.health >= this.maxHealth; }
  get isFullMana(): boolean { return this.mana >= this.maxMana; }
  get isFullStamina(): boolean { return this.stamina >= this.maxStamina; }
  get healthPercent(): number { return (this.health / this.maxHealth) * 100; }
  get experienceToNextLevel(): number { return this.level * 1000; }

  takeDamage(amount: number): CharacterStatistics {
    return new CharacterStatistics({
      ...this,
      health: Math.max(0, this.health - amount),
    });
  }

  heal(amount: number): CharacterStatistics {
    return new CharacterStatistics({
      ...this,
      health: Math.min(this.maxHealth, this.health + amount),
    });
  }

  addExperience(amount: number): CharacterStatistics {
    const total = this.experiencePoints + amount;
    const xpNeeded = this.experienceToNextLevel;
    if (total >= xpNeeded) {
      return new CharacterStatistics({
        ...this,
        level: this.level + 1,
        experiencePoints: total - xpNeeded,
        maxHealth: this.maxHealth + 10,
        health: this.maxHealth + 10,
      });
    }
    return new CharacterStatistics({ ...this, experiencePoints: total });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.level, this.experiencePoints, this.health, this.maxHealth, this.mana, this.maxMana, this.stamina, this.maxStamina];
  }

  toJSON(): Record<string, unknown> {
    return {
      level: this.level,
      experiencePoints: this.experiencePoints,
      health: this.health,
      maxHealth: this.maxHealth,
      mana: this.mana,
      maxMana: this.maxMana,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
    };
  }
}
