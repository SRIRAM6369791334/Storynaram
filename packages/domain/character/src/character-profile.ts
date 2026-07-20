import { ValueObject } from '@storynaram/domain-kernel';
import { CharacterIdentity } from './character-identity';

export class CharacterName extends ValueObject {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly middleName?: string,
    public readonly nickName?: string,
  ) {
    super();
  }

  get fullName(): string {
    return this.middleName
      ? `${this.firstName} ${this.middleName} ${this.lastName}`
      : `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.nickName ?? this.firstName;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.firstName, this.lastName, this.middleName, this.nickName];
  }

  toJSON(): Record<string, unknown> {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      middleName: this.middleName,
      nickName: this.nickName,
    };
  }
}

export class CharacterAge extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 0) throw new Error(`Age cannot be negative: ${value}`);
    if (value > 1000) throw new Error(`Age exceeds maximum: ${value}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class CharacterBirthDate extends ValueObject {
  constructor(public readonly value: Date) {
    super();
    if (value > new Date()) throw new Error('Birth date cannot be in the future');
  }

  static fromISOString(iso: string): CharacterBirthDate {
    return new CharacterBirthDate(new Date(iso));
  }

  get age(): number {
    const now = new Date();
    const diff = now.getTime() - this.value.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.getTime()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value.toISOString() };
  }
}

export class CharacterGender extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Gender cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class CharacterSpecies extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Species cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class CharacterOccupation extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class CharacterRole extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Role cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export class CharacterTitle extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

export interface CharacterProfileProps {
  name: CharacterName;
  age: CharacterAge;
  birthDate: CharacterBirthDate;
  gender: CharacterGender;
  species: CharacterSpecies;
  occupation?: CharacterOccupation;
  role: CharacterRole;
  title?: CharacterTitle;
}

export class CharacterProfile extends ValueObject {
  public readonly name: CharacterName;
  public readonly age: CharacterAge;
  public readonly birthDate: CharacterBirthDate;
  public readonly gender: CharacterGender;
  public readonly species: CharacterSpecies;
  public readonly occupation: CharacterOccupation;
  public readonly role: CharacterRole;
  public readonly title: CharacterTitle;

  constructor(props: CharacterProfileProps) {
    super();
    this.name = props.name;
    this.age = props.age;
    this.birthDate = props.birthDate;
    this.gender = props.gender;
    this.species = props.species;
    this.occupation = props.occupation ?? new CharacterOccupation('');
    this.role = props.role;
    this.title = props.title ?? new CharacterTitle('');
  }

  withName(name: CharacterName): CharacterProfile {
    return new CharacterProfile({ ...this, name });
  }

  withAge(age: CharacterAge): CharacterProfile {
    return new CharacterProfile({ ...this, age, birthDate: this.birthDate });
  }

  withRole(role: CharacterRole): CharacterProfile {
    return new CharacterProfile({ ...this, role });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.name, this.age, this.birthDate, this.gender, this.species, this.occupation, this.role, this.title];
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name.toJSON(),
      age: this.age.toJSON(),
      birthDate: this.birthDate.toJSON(),
      gender: this.gender.toJSON(),
      species: this.species.toJSON(),
      occupation: this.occupation.toJSON(),
      role: this.role.toJSON(),
      title: this.title.toJSON(),
    };
  }
}
