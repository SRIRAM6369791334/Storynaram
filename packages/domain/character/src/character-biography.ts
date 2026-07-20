import { ValueObject, Timestamp } from '@storynaram/domain-kernel';

export interface BiographyEntry {
  timestamp: Timestamp;
  title: string;
  content: string;
}

export class CharacterBiography extends ValueObject {
  public readonly backstory: string;
  public readonly history: readonly BiographyEntry[];

  constructor(backstory: string = '', history: BiographyEntry[] = []) {
    super();
    this.backstory = backstory;
    this.history = Object.freeze([...history]);
  }

  addEntry(title: string, content: string): CharacterBiography {
    const entry: BiographyEntry = {
      timestamp: Timestamp.now(),
      title,
      content,
    };
    return new CharacterBiography(this.backstory, [...this.history, entry]);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.backstory, ...this.history];
  }

  toJSON(): Record<string, unknown> {
    return {
      backstory: this.backstory,
      history: this.history.map(e => ({
        timestamp: e.timestamp.toJSON(),
        title: e.title,
        content: e.content,
      })),
    };
  }
}
