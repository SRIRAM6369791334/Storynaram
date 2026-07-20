import { ValueObject } from '@storynaram/domain-kernel';

export class CharacterSkill {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public level: number,
    public experience: number = 0,
    public isProficient: boolean = false,
  ) {}

  addExperience(amount: number): void {
    this.experience += amount;
    while (this.experience >= this.experienceToNextLevel()) {
      this.experience -= this.experienceToNextLevel();
      this.level++;
    }
  }

  experienceToNextLevel(): number {
    return this.level * 100;
  }
}

export class CharacterSkills extends ValueObject {
  private readonly items: Map<string, CharacterSkill>;

  constructor(skills: CharacterSkill[] = []) {
    super();
    this.items = new Map();
    for (const skill of skills) {
      this.items.set(skill.name.toLowerCase(), skill);
    }
  }

  get all(): readonly CharacterSkill[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  has(name: string): boolean {
    return this.items.has(name.toLowerCase());
  }

  get(name: string): CharacterSkill | undefined {
    return this.items.get(name.toLowerCase());
  }

  add(skill: CharacterSkill): CharacterSkills {
    const next = new Map(this.items);
    next.set(skill.name.toLowerCase(), skill);
    return new CharacterSkills(Array.from(next.values()));
  }

  remove(name: string): CharacterSkills {
    const next = new Map(this.items);
    next.delete(name.toLowerCase());
    return new CharacterSkills(Array.from(next.values()));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown>[] {
    return this.all.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      experience: s.experience,
      isProficient: s.isProficient,
    }));
  }
}
