import { ValueObject } from '@storynaram/domain-kernel';

export type NarrativeStatusType = 'idea' | 'outline' | 'firstDraft' | 'revision' | 'beta' | 'completed' | 'published' | 'archived';

export class NarrativeStatus extends ValueObject {
  constructor(public readonly value: NarrativeStatusType) {
    super();
  }

  isDraft(): boolean {
    return this.value === 'idea' || this.value === 'outline' || this.value === 'firstDraft';
  }

  isCompleted(): boolean {
    return this.value === 'completed';
  }

  isPublished(): boolean {
    return this.value === 'published';
  }

  isArchived(): boolean {
    return this.value === 'archived';
  }

  canTransitionTo(next: NarrativeStatusType): boolean {
    const valid: Record<NarrativeStatusType, NarrativeStatusType[]> = {
      idea: ['outline', 'firstDraft', 'archived'],
      outline: ['firstDraft', 'archived'],
      firstDraft: ['revision', 'archived'],
      revision: ['beta', 'archived'],
      beta: ['completed', 'archived'],
      completed: ['published', 'revision', 'archived'],
      published: ['archived'],
      archived: [],
    };
    return valid[this.value]?.includes(next) ?? false;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}
