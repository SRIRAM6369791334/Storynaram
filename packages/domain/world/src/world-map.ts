import { ValueObject } from '@storynaram/domain-kernel';
import { Region } from './world-political.js';
import { Biome } from './world-geography.js';

export class WorldMap extends ValueObject {
  private readonly items: Map<string, Region>;

  constructor(regions: Region[] = []) {
    super();
    this.items = new Map();
    for (const r of regions) {
      this.items.set(r.id, r);
    }
  }

  get all(): readonly Region[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  get(id: string): Region | undefined {
    return this.items.get(id);
  }

  findByName(name: string): Region | undefined {
    return this.all.find(r => r.name.toLowerCase() === name.toLowerCase());
  }

  add(region: Region): WorldMap {
    const next = new Map(this.items);
    next.set(region.id, region);
    return new WorldMap(Array.from(next.values()));
  }

  remove(id: string): WorldMap {
    const next = new Map(this.items);
    next.delete(id);
    return new WorldMap(Array.from(next.values()));
  }

  findByBiome(biome: string): Region[] {
    return this.all.filter(r => r.biome.value.toLowerCase() === biome.toLowerCase());
  }

  rootRegions(): Region[] {
    return this.all.filter(r => !r.hasParent());
  }

  childRegions(parentId: string): Region[] {
    return this.all.filter(r => r.parentRegionId === parentId);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(r => ({
      id: r.id,
      name: r.name,
      coordinates: r.coordinates.map(c => c.toJSON()),
      area: r.area.toJSON(),
      biome: r.biome.toJSON(),
      climate: r.climate.toJSON(),
      population: r.population.toJSON(),
      elevation: r.elevation,
      parentRegionId: r.parentRegionId,
    }))};
  }
}
