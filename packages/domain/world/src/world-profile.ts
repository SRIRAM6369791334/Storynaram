import { ValueObject } from '@storynaram/domain-kernel';

export class WorldName extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('World name cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class WorldDescription extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export interface WorldProfileProps {
  name: WorldName;
  description: WorldDescription;
  genre: string;
  tone: string;
}

export class WorldProfile extends ValueObject {
  public readonly name: WorldName;
  public readonly description: WorldDescription;
  public readonly genre: string;
  public readonly tone: string;

  constructor(props: WorldProfileProps) {
    super();
    this.name = props.name;
    this.description = props.description;
    this.genre = props.genre;
    this.tone = props.tone;
  }

  withName(name: WorldName): WorldProfile {
    return new WorldProfile({ ...this, name });
  }

  withDescription(description: WorldDescription): WorldProfile {
    return new WorldProfile({ ...this, description });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.name, this.description, this.genre, this.tone];
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name.toJSON(),
      description: this.description.toJSON(),
      genre: this.genre,
      tone: this.tone,
    };
  }
}
