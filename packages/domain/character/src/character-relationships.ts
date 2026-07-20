import { ValueObject } from '@storynaram/domain-kernel';

export enum RelationshipType {
  FRIEND = 'FRIEND',
  RIVAL = 'RIVAL',
  ENEMY = 'ENEMY',
  FAMILY = 'FAMILY',
  LOVER = 'LOVER',
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
  ALLY = 'ALLY',
  ASSOCIATE = 'ASSOCIATE',
}

export class CharacterRelationship {
  constructor(
    public readonly id: string,
    public readonly targetId: string,
    public readonly targetName: string,
    public type: RelationshipType,
    public strength: number = 50,
    public isMutual: boolean = false,
  ) {
    if (strength < 0 || strength > 100) {
      throw new Error(`Relationship strength must be between 0 and 100: ${strength}`);
    }
  }

  strengthen(amount: number): void {
    this.strength = Math.min(100, this.strength + amount);
  }

  weaken(amount: number): void {
    this.strength = Math.max(0, this.strength - amount);
  }
}

export class CharacterRelationships extends ValueObject {
  private readonly items: Map<string, CharacterRelationship>;

  constructor(relationships: CharacterRelationship[] = []) {
    super();
    this.items = new Map();
    for (const rel of relationships) {
      this.items.set(rel.id, rel);
    }
  }

  get all(): readonly CharacterRelationship[] {
    return Array.from(this.items.values());
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): CharacterRelationship | undefined {
    return this.items.get(id);
  }

  add(relationship: CharacterRelationship): CharacterRelationships {
    const next = new Map(this.items);
    next.set(relationship.id, relationship);
    return new CharacterRelationships(Array.from(next.values()));
  }

  remove(id: string): CharacterRelationships {
    const next = new Map(this.items);
    next.delete(id);
    return new CharacterRelationships(Array.from(next.values()));
  }

  ofType(type: RelationshipType): CharacterRelationship[] {
    return this.all.filter(r => r.type === type);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown>[] {
    return this.all.map(r => ({
      id: r.id,
      targetId: r.targetId,
      targetName: r.targetName,
      type: r.type,
      strength: r.strength,
      isMutual: r.isMutual,
    }));
  }
}
