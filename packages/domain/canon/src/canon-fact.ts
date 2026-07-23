import { ValueObject } from '@storynaram/domain-kernel';
import { CanonReference } from './canon-reference.js';

export type FactType = 'character' | 'world' | 'timeline' | 'location' | 'magic' | 'technology' | 'relationship' | 'history' | 'lore' | 'book' | 'scene';

export class CanonFact extends ValueObject {
  constructor(
    public readonly factId: string,
    public readonly factType: FactType,
    public readonly key: string,
    public readonly value: unknown,
    public readonly references: readonly CanonReference[] = [],
    public readonly confidence: number = 1,
    public readonly tags: readonly string[] = [],
  ) {
    super();
    if (factId.trim().length === 0) throw new Error('Fact ID cannot be empty');
    if (key.trim().length === 0) throw new Error('Fact key cannot be empty');
    if (confidence < 0 || confidence > 1) throw new Error('Confidence must be between 0 and 1');
  }

  hasTag(tag: string): boolean {
    return this.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  protected getEqualityComponents(): unknown[] {
    return [this.factId, this.factType, this.key, this.confidence, this.tags.length];
  }

  toJSON(): Record<string, unknown> {
    return {
      factId: this.factId,
      factType: this.factType,
      key: this.key,
      value: this.value,
      references: this.references.map(r => r.toJSON()),
      confidence: this.confidence,
      tags: [...this.tags],
    };
  }
}
