import { ValueObject } from '@storynaram/domain-kernel';

export type StoryFormat = 'novel' | 'screenplay' | 'comic' | 'interactive' | 'rpgCampaign' | 'tvSeries';
export type StoryStatus = 'draft' | 'planning' | 'writing' | 'completed' | 'published';

export class StoryProfile extends ValueObject {
  constructor(
    public readonly title: string,
    public readonly format: StoryFormat = 'novel',
    public readonly status: StoryStatus = 'draft',
    public readonly genre: readonly string[] = [],
    public readonly language: string = 'en',
    public readonly targetAudience: string = 'adult',
    public readonly seriesName: string = '',
    public readonly seriesOrder: number = 0,
    public readonly isStandalone: boolean = true,
  ) {
    super();
    if (title.trim().length === 0) throw new Error('Story title cannot be empty');
  }

  withStatus(status: StoryStatus): StoryProfile {
    return new StoryProfile(
      this.title, this.format, status, this.genre, this.language,
      this.targetAudience, this.seriesName, this.seriesOrder, this.isStandalone,
    );
  }

  protected getEqualityComponents(): unknown[] {
    return [this.title.toLowerCase(), this.format, this.status];
  }

  toJSON(): Record<string, unknown> {
    return {
      title: this.title, format: this.format, status: this.status,
      genre: [...this.genre], language: this.language,
      targetAudience: this.targetAudience, seriesName: this.seriesName,
      seriesOrder: this.seriesOrder, isStandalone: this.isStandalone,
    };
  }
}
