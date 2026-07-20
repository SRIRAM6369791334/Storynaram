import { ValueObject } from '@storynaram/domain-kernel';

export type TechEra = 'stone_age' | 'bronze_age' | 'iron_age' | 'medieval' | 'renaissance' | 'industrial' | 'modern' | 'futuristic' | 'ancient_advanced' | 'post_apocalyptic';

export class TechnologyLevel extends ValueObject {
  constructor(
    public readonly era: TechEra,
    public readonly description: string,
    public readonly advancements: string[],
  ) {
    super();
    if (description.trim().length === 0) throw new Error('Technology level description cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.era, this.description, ...this.advancements];
  }

  toJSON(): Record<string, unknown> {
    return {
      era: this.era,
      description: this.description,
      advancements: this.advancements,
    };
  }
}
