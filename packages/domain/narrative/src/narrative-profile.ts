import { ValueObject } from '@storynaram/domain-kernel';
import { NarrativeTitle, Subtitle } from './narrative-title.js';
import { Synopsis, Summary } from './narrative-synopsis.js';
import { Genre, Audience, Language } from './narrative-genre.js';
import { NarrativeStatus } from './narrative-status.js';
import { WordCount, ReadingTime } from './narrative-metrics.js';

export type NarrativeFormat = 'novel' | 'lightNovel' | 'comic' | 'manga' | 'screenplay' | 'tvSeries' | 'visualNovel' | 'interactiveFiction' | 'rpgCampaign' | 'other';

export class NarrativeProfile extends ValueObject {
  constructor(
    public readonly title: NarrativeTitle,
    public readonly format: NarrativeFormat,
    public readonly subtitle?: Subtitle,
    public readonly synopsis?: Synopsis,
    public readonly summary?: Summary,
    public readonly genres: readonly Genre[] = [],
    public readonly audience: Audience = new Audience('adult'),
    public readonly language: Language = new Language('en'),
    public readonly status: NarrativeStatus = new NarrativeStatus('idea'),
    public readonly wordCount: WordCount = WordCount.zero(),
    public readonly readingTime?: ReadingTime,
  ) {
    super();
  }

  withStatus(status: NarrativeStatus): NarrativeProfile {
    return new NarrativeProfile(
      this.title, this.format, this.subtitle, this.synopsis, this.summary,
      this.genres, this.audience, this.language, status, this.wordCount, this.readingTime,
    );
  }

  protected getEqualityComponents(): unknown[] {
    return [this.title, this.format, this.status, this.wordCount];
  }

  toJSON(): Record<string, unknown> {
    return {
      title: this.title.value,
      format: this.format,
      subtitle: this.subtitle?.value,
      synopsis: this.synopsis?.value,
      summary: this.summary?.value,
      genres: this.genres.map(g => g.value),
      audience: this.audience.value,
      language: this.language.value,
      status: this.status.value,
      wordCount: this.wordCount.value,
      readingTime: this.readingTime?.minutes,
    };
  }
}
