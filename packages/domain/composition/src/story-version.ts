import { ValueObject } from '@storynaram/domain-kernel';

export class StoryVersion extends ValueObject {
  constructor(
    public readonly major: number = 1,
    public readonly minor: number = 0,
    public readonly patch: number = 0,
  ) {
    super();
    if (major < 0) throw new Error('Major version cannot be negative');
    if (minor < 0) throw new Error('Minor version cannot be negative');
    if (patch < 0) throw new Error('Patch version cannot be negative');
  }

  get label(): string {
    return `v${this.major}.${this.minor}.${this.patch}`;
  }

  bumpMajor(): StoryVersion {
    return new StoryVersion(this.major + 1, 0, 0);
  }

  bumpMinor(): StoryVersion {
    return new StoryVersion(this.major, this.minor + 1, 0);
  }

  bumpPatch(): StoryVersion {
    return new StoryVersion(this.major, this.minor, this.patch + 1);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.major, this.minor, this.patch];
  }

  toJSON(): Record<string, unknown> {
    return { major: this.major, minor: this.minor, patch: this.patch, label: this.label };
  }
}
