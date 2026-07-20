import { ValueObject } from '@storynaram/domain-kernel';

export class Coordinates extends ValueObject {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {
    super();
    if (latitude < -90 || latitude > 90) throw new Error(`Invalid latitude: ${latitude}`);
    if (longitude < -180 || longitude > 180) throw new Error(`Invalid longitude: ${longitude}`);
  }

  distanceTo(other: Coordinates): number {
    const R = 6371;
    const dLat = (other.latitude - this.latitude) * Math.PI / 180;
    const dLon = (other.longitude - this.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.latitude * Math.PI / 180) * Math.cos(other.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.latitude, this.longitude];
  }

  toJSON(): Record<string, unknown> {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}

export class Area extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 0) throw new Error(`Area cannot be negative: ${value}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Elevation extends ValueObject {
  constructor(public readonly value: number) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Temperature extends ValueObject {
  constructor(public readonly value: number) {
    super();
  }

  get isFreezing(): boolean {
    return this.value <= 0;
  }

  get isBoiling(): boolean {
    return this.value >= 100;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Population extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 0) throw new Error(`Population cannot be negative: ${value}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Biome extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Biome cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class Climate extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Climate cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export interface WorldGeographyProps {
  totalArea: Area;
  totalPopulation: Population;
  terrain: string;
  primaryClimate: Climate;
  primaryBiome: Biome;
}

export class WorldGeography extends ValueObject {
  public readonly totalArea: Area;
  public readonly totalPopulation: Population;
  public readonly terrain: string;
  public readonly primaryClimate: Climate;
  public readonly primaryBiome: Biome;

  constructor(props: WorldGeographyProps) {
    super();
    this.totalArea = props.totalArea;
    this.totalPopulation = props.totalPopulation;
    this.terrain = props.terrain;
    this.primaryClimate = props.primaryClimate;
    this.primaryBiome = props.primaryBiome;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalArea, this.totalPopulation, this.terrain, this.primaryClimate, this.primaryBiome];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalArea: this.totalArea.toJSON(),
      totalPopulation: this.totalPopulation.toJSON(),
      terrain: this.terrain,
      primaryClimate: this.primaryClimate.toJSON(),
      primaryBiome: this.primaryBiome.toJSON(),
    };
  }
}
