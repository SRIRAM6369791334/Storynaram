import { ValueObject } from '@storynaram/domain-kernel';

export type FactionType = 'political' | 'religious' | 'military' | 'guild' | 'secret' | 'trade' | 'cultural' | 'magical' | 'criminal';

export class Faction {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly type: FactionType,
    public readonly influence: number,
    public readonly leaderId?: string,
    public readonly memberIds: string[] = [],
  ) {
    if (name.trim().length === 0) throw new Error('Faction name cannot be empty');
    if (influence < 0 || influence > 100) throw new Error(`Faction influence must be between 0 and 100: ${influence}`);
  }

  hasMember(characterId: string): boolean {
    return this.memberIds.includes(characterId);
  }
}

export class WorldFactions extends ValueObject {
  private readonly items: Map<string, Faction>;

  constructor(factions: Faction[] = []) {
    super();
    this.items = new Map();
    for (const f of factions) {
      this.items.set(f.id, f);
    }
  }

  get all(): readonly Faction[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): Faction | undefined {
    return this.items.get(id);
  }

  add(faction: Faction): WorldFactions {
    const next = new Map(this.items);
    next.set(faction.id, faction);
    return new WorldFactions(Array.from(next.values()));
  }

  remove(id: string): WorldFactions {
    const next = new Map(this.items);
    next.delete(id);
    return new WorldFactions(Array.from(next.values()));
  }

  ofType(type: FactionType): Faction[] {
    return this.all.filter(f => f.type === type);
  }

  withInfluenceAbove(threshold: number): Faction[] {
    return this.all.filter(f => f.influence >= threshold);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      type: f.type,
      influence: f.influence,
      leaderId: f.leaderId,
      memberIds: f.memberIds,
    }))};
  }
}
