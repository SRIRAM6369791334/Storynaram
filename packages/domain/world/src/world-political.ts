import { ValueObject } from '@storynaram/domain-kernel';
import { Coordinates, Area, Population, Biome, Climate } from './world-geography';

export class Region {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly coordinates: Coordinates[],
    public readonly area: Area,
    public readonly biome: Biome,
    public readonly climate: Climate,
    public readonly population: Population,
    public readonly elevation: number = 0,
    public readonly parentRegionId?: string,
  ) {
    if (name.trim().length === 0) throw new Error('Region name cannot be empty');
  }

  hasParent(): boolean {
    return this.parentRegionId !== undefined;
  }
}

export class PoliticalSystem extends ValueObject {
  constructor(
    public readonly type: 'monarchy' | 'republic' | 'theocracy' | 'dictatorship' | 'democracy' | 'oligarchy' | 'feudal' | 'tribal' | 'magocracy',
    public readonly description: string,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.type, this.description];
  }

  toJSON(): Record<string, unknown> {
    return { type: this.type, description: this.description };
  }
}

export class Kingdom {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly ruler: string,
    public readonly capitalCityId: string,
    public readonly regionIds: string[],
    public readonly politicalSystem: PoliticalSystem,
    public readonly population: Population,
  ) {
    if (name.trim().length === 0) throw new Error('Kingdom name cannot be empty');
  }
}

export class Nation {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capitalCityId: string,
    public readonly governmentType: PoliticalSystem,
    public readonly population: Population,
    public readonly officialLanguageIds: string[],
  ) {
    if (name.trim().length === 0) throw new Error('Nation name cannot be empty');
  }
}
