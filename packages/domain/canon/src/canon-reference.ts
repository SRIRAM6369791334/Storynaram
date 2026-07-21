import { ValueObject } from '@storynaram/domain-kernel';

export type DomainType = 'character' | 'world' | 'timeline' | 'location' | 'magic' | 'technology' | 'relationship' | 'history' | 'lore' | 'book' | 'scene' | 'system';

export class CanonReference extends ValueObject {
  constructor(
    public readonly domainType: DomainType,
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly property: string = '',
  ) {
    super();
    if (domainType.trim().length === 0) throw new Error('Domain type cannot be empty');
    if (entityId.trim().length === 0) throw new Error('Entity ID cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.domainType, this.entityId, this.entityType, this.property];
  }

  toJSON(): Record<string, unknown> {
    return {
      domainType: this.domainType,
      entityId: this.entityId,
      entityType: this.entityType,
      property: this.property,
    };
  }
}
