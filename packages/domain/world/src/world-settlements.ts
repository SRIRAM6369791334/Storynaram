import { ValueObject } from '@storynaram/domain-kernel';
import { Coordinates } from './world-geography';

export class City {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly coordinates: Coordinates,
    public readonly population: number,
  ) {
    if (name.trim().length === 0) throw new Error('City name cannot be empty');
    if (population < 0) throw new Error('City population cannot be negative');
  }
}

export class Village {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly coordinates: Coordinates,
    public readonly population: number,
    public readonly primaryIndustry?: string,
  ) {
    if (name.trim().length === 0) throw new Error('Village name cannot be empty');
    if (population < 0) throw new Error('Village population cannot be negative');
  }
}

export class Landmark {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: 'natural' | 'constructed' | 'ruin' | 'sacred' | 'magical',
    public readonly coordinates: Coordinates,
    public readonly description: string,
  ) {
    if (name.trim().length === 0) throw new Error('Landmark name cannot be empty');
  }
}

export class WorldSettlements extends ValueObject {
  private readonly cities: Map<string, City>;
  private readonly villages: Map<string, Village>;
  private readonly landmarks: Map<string, Landmark>;

  constructor(props?: { cities?: City[]; villages?: Village[]; landmarks?: Landmark[] }) {
    super();
    this.cities = new Map();
    this.villages = new Map();
    this.landmarks = new Map();
    if (props) {
      for (const c of props.cities ?? []) this.cities.set(c.id, c);
      for (const v of props.villages ?? []) this.villages.set(v.id, v);
      for (const l of props.landmarks ?? []) this.landmarks.set(l.id, l);
    }
  }

  get allCities(): readonly City[] { return Array.from(this.cities.values()); }
  get allVillages(): readonly Village[] { return Array.from(this.villages.values()); }
  get allLandmarks(): readonly Landmark[] { return Array.from(this.landmarks.values()); }
  get cityCount(): number { return this.cities.size; }
  get villageCount(): number { return this.villages.size; }
  get landmarkCount(): number { return this.landmarks.size; }

  addCity(city: City): WorldSettlements {
    const next = new Map(this.cities);
    next.set(city.id, city);
    return new WorldSettlements({ cities: Array.from(next.values()), villages: this.allVillages as Village[], landmarks: this.allLandmarks as Landmark[] });
  }

  addVillage(village: Village): WorldSettlements {
    const next = new Map(this.villages);
    next.set(village.id, village);
    return new WorldSettlements({ cities: this.allCities as City[], villages: Array.from(next.values()), landmarks: this.allLandmarks as Landmark[] });
  }

  addLandmark(landmark: Landmark): WorldSettlements {
    const next = new Map(this.landmarks);
    next.set(landmark.id, landmark);
    return new WorldSettlements({ cities: this.allCities as City[], villages: this.allVillages as Village[], landmarks: Array.from(next.values()) });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.cityCount, this.villageCount, this.landmarkCount];
  }

  toJSON(): Record<string, unknown> {
    return {
      cities: this.allCities.map(c => ({ id: c.id, name: c.name, coordinates: c.coordinates.toJSON(), population: c.population })),
      villages: this.allVillages.map(v => ({ id: v.id, name: v.name, coordinates: v.coordinates.toJSON(), population: v.population, primaryIndustry: v.primaryIndustry })),
      landmarks: this.allLandmarks.map(l => ({ id: l.id, name: l.name, type: l.type, coordinates: l.coordinates.toJSON(), description: l.description })),
    };
  }
}
