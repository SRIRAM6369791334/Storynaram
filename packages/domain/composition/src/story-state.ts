import { ValueObject } from '@storynaram/domain-kernel';

export type StoryPhase = 'concept' | 'outline' | 'development' | 'drafting' | 'revision' | 'polish' | 'complete';

export class StoryState extends ValueObject {
  constructor(
    public readonly phase: StoryPhase = 'concept',
    public readonly isComplete: boolean = false,
    public readonly isPublished: boolean = false,
    public readonly isArchived: boolean = false,
  ) {
    super();
  }

  withPhase(phase: StoryPhase): StoryState {
    return new StoryState(phase, this.isComplete, this.isPublished, this.isArchived);
  }

  markComplete(): StoryState {
    return new StoryState('complete', true, this.isPublished, this.isArchived);
  }

  markPublished(): StoryState {
    return new StoryState(this.phase, this.isComplete, true, this.isArchived);
  }

  markArchived(): StoryState {
    return new StoryState(this.phase, this.isComplete, this.isPublished, true);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.phase, this.isComplete, this.isPublished, this.isArchived];
  }

  toJSON(): Record<string, unknown> {
    return {
      phase: this.phase, isComplete: this.isComplete,
      isPublished: this.isPublished, isArchived: this.isArchived,
    };
  }
}
