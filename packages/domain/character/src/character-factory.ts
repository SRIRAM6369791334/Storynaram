import { Factory, FactoryError } from '@storynaram/domain-kernel';
import { CharacterAggregate } from './character-aggregate';
import { CharacterIdentity } from './character-identity';
import {
  CharacterProfile,
  CharacterName,
  CharacterAge,
  CharacterBirthDate,
  CharacterGender,
  CharacterSpecies,
  CharacterRole,
  CharacterOccupation,
  CharacterTitle,
} from './character-profile';
import { CharacterAppearance } from './character-appearance';
import { CharacterPersonality, CharacterTraits, CharacterAlignment } from './character-personality';
import { CharacterAbilities } from './character-abilities';
import { CharacterStatus, LifeStage, Consciousness } from './character-status';
import { CharacterStatistics } from './character-statistics';
import { CharacterBiography } from './character-biography';
import { assertAgeValid } from './business-rules';

export interface CreateCharacterProfileInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  nickName?: string;
  age: number;
  gender: string;
  species: string;
  role: string;
  occupation?: string;
  title?: string;
}

export interface CreateCharacterAppearanceInput {
  height?: number;
  weight?: number;
  hairColor?: string;
  eyeColor?: string;
  skinColor?: string;
  distinguishingFeatures?: string[];
}

export interface CreateCharacterPersonalityInput {
  traits?: string[];
  alignment?: { moral: 'good' | 'neutral' | 'evil'; ethical: 'lawful' | 'neutral' | 'chaotic' };
}

export interface CreateCharacterAbilitiesInput {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface CreateCharacterProps {
  identity?: string;
  profile: CreateCharacterProfileInput;
  appearance?: CreateCharacterAppearanceInput;
  personality?: CreateCharacterPersonalityInput;
  abilities?: CreateCharacterAbilitiesInput;
  backstory?: string;
}

export class CharacterFactory extends Factory<CharacterAggregate, CreateCharacterProps> {
  create(props: CreateCharacterProps): CharacterAggregate {
    this.assertValid(props.profile.firstName.length > 0, 'First name is required');
    this.assertValid(props.profile.lastName.length > 0, 'Last name is required');
    this.assertValid(props.profile.age >= 0, 'Age cannot be negative');
    assertAgeValid(props.profile.age);

    const identity = props.identity
      ? new CharacterIdentity(props.identity)
      : CharacterIdentity.create();

    const character = new CharacterAggregate(identity);

    const birthDate = new CharacterBirthDate(
      new Date(Date.now() - props.profile.age * 365.25 * 24 * 60 * 60 * 1000),
    );

    const profile = new CharacterProfile({
      name: new CharacterName(
        props.profile.firstName,
        props.profile.lastName,
        props.profile.middleName,
        props.profile.nickName,
      ),
      age: new CharacterAge(props.profile.age),
      birthDate,
      gender: new CharacterGender(props.profile.gender),
      species: new CharacterSpecies(props.profile.species),
      role: new CharacterRole(props.profile.role),
      occupation: props.profile.occupation ? new CharacterOccupation(props.profile.occupation) : undefined,
      title: props.profile.title ? new CharacterTitle(props.profile.title) : undefined,
    });

    character.applyProfile(profile);

    if (props.appearance) {
      character.applyAppearance(new CharacterAppearance(props.appearance));
    }

    if (props.personality) {
      const personality = new CharacterPersonality({
        traits: props.personality.traits ? new CharacterTraits(props.personality.traits) : undefined,
        alignment: props.personality.alignment
          ? new CharacterAlignment(props.personality.alignment.moral, props.personality.alignment.ethical)
          : undefined,
      });
      character.applyPersonality(personality);
    }

    if (props.abilities) {
      character.applyAbilities(new CharacterAbilities(props.abilities));
    }

    if (props.backstory) {
      character.applyBiography(new CharacterBiography(props.backstory));
    }

    character.applyStatus(new CharacterStatus({
      isAlive: true,
      isPlayable: true,
      lifeStage: LifeStage.ADULT,
      consciousness: Consciousness.AWAKE,
    }));

    character.applyStatistics(new CharacterStatistics());

    character.initialize(profile);

    return character;
  }

  reconstitute(state: Record<string, unknown>): CharacterAggregate {
    const identity = new CharacterIdentity(state.identity as string);
    const character = new CharacterAggregate(identity);

    const profileData = state.profile as Record<string, unknown>;
    const profile = new CharacterProfile({
      name: new CharacterName(
        (profileData.name as Record<string, unknown>).firstName as string,
        (profileData.name as Record<string, unknown>).lastName as string,
        (profileData.name as Record<string, unknown>).middleName as string | undefined,
        (profileData.name as Record<string, unknown>).nickName as string | undefined,
      ),
      age: new CharacterAge((profileData.age as Record<string, unknown>).value as number),
      birthDate: CharacterBirthDate.fromISOString((profileData.birthDate as Record<string, unknown>).value as string),
      gender: new CharacterGender((profileData.gender as Record<string, unknown>).value as string),
      species: new CharacterSpecies((profileData.species as Record<string, unknown>).value as string),
      role: new CharacterRole((profileData.role as Record<string, unknown>).value as string),
      occupation: profileData.occupation
        ? new CharacterOccupation((profileData.occupation as Record<string, unknown>).value as string)
        : undefined,
      title: profileData.title
        ? new CharacterTitle((profileData.title as Record<string, unknown>).value as string)
        : undefined,
    });
    character.applyProfile(profile);

    return character;
  }
}
