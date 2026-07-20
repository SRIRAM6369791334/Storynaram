import { ValueObject } from '@storynaram/domain-kernel';
import { Currency } from './world-culture';

export type EconomicSystemType = 'traditional' | 'market' | 'command' | 'mixed' | 'feudal' | 'guild' | 'barter' | 'magical';

export class EconomicSystem extends ValueObject {
  constructor(
    public readonly type: EconomicSystemType,
    public readonly description: string,
    public readonly currency: Currency,
    public readonly majorIndustries: string[],
  ) {
    super();
    if (description.trim().length === 0) throw new Error('Economic system description cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.type, this.description, this.currency.name, ...this.majorIndustries];
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      description: this.description,
      currency: { id: this.currency.id, name: this.currency.name, code: this.currency.code.value, symbol: this.currency.symbol },
      majorIndustries: this.majorIndustries,
    };
  }
}

export type ResourceType = 'mineral' | 'agricultural' | 'magical' | 'energy' | 'water' | 'timber' | 'animal';
export type ResourceAbundance = 'scarce' | 'moderate' | 'abundant';

export class NaturalResource {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: ResourceType,
    public readonly abundance: ResourceAbundance,
    public readonly regionId: string,
    public readonly isRenewable: boolean = false,
  ) {
    if (name.trim().length === 0) throw new Error('Resource name cannot be empty');
  }
}

export class WorldNaturalResources extends ValueObject {
  private readonly items: Map<string, NaturalResource>;

  constructor(resources: NaturalResource[] = []) {
    super();
    this.items = new Map();
    for (const r of resources) {
      this.items.set(r.id, r);
    }
  }

  get all(): readonly NaturalResource[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): NaturalResource | undefined {
    return this.items.get(id);
  }

  add(resource: NaturalResource): WorldNaturalResources {
    const next = new Map(this.items);
    next.set(resource.id, resource);
    return new WorldNaturalResources(Array.from(next.values()));
  }

  remove(id: string): WorldNaturalResources {
    const next = new Map(this.items);
    next.delete(id);
    return new WorldNaturalResources(Array.from(next.values()));
  }

  byType(type: ResourceType): NaturalResource[] {
    return this.all.filter(r => r.type === type);
  }

  byRegion(regionId: string): NaturalResource[] {
    return this.all.filter(r => r.regionId === regionId);
  }

  byAbundance(abundance: ResourceAbundance): NaturalResource[] {
    return this.all.filter(r => r.abundance === abundance);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      abundance: r.abundance,
      regionId: r.regionId,
      isRenewable: r.isRenewable,
    }))};
  }
}
