import { ValueObject } from '@storynaram/domain-kernel';

export type GenreType = 'fantasy' | 'scifi' | 'horror' | 'romance' | 'thriller' | 'mystery' | 'comedy' | 'drama' | 'action' | 'adventure' | 'sliceOfLife' | 'historical' | 'literary' | 'youngAdult' | 'children' | 'erotic' | 'western' | 'superhero' | 'mythology' | 'steampunk' | 'cyberpunk' | 'urbanFantasy' | 'darkFantasy' | 'epicFantasy' | 'litRPG' | 'gameLit' | 'fanFiction' | 'other';

export type AudienceType = 'children' | 'youngAdult' | 'adult' | 'mature' | 'allAges';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'other';

export class Genre extends ValueObject {
  constructor(public readonly value: GenreType) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class Audience extends ValueObject {
  constructor(public readonly value: AudienceType) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class Language extends ValueObject {
  constructor(public readonly value: LanguageCode) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}
