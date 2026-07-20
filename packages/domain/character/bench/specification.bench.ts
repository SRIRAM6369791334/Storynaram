import { bench, describe } from 'vitest';
import { CharacterAggregate } from '../src/character-aggregate';
import { CharacterIdentity } from '../src/character-identity';
import { CharacterProfile, CharacterName, CharacterAge, CharacterBirthDate, CharacterGender, CharacterSpecies, CharacterRole } from '../src/character-profile';
import { CharacterStatus } from '../src/character-status';
import { AliveSpecification, DeadSpecification, PlayableSpecification, HeroSpecification } from '../src/character-specifications';

function createCharacter(id: string, role: string): CharacterAggregate {
  const char = new CharacterAggregate(new CharacterIdentity(id));
  char.applyProfile(new CharacterProfile({
    name: new CharacterName('Test', id),
    age: new CharacterAge(25),
    birthDate: CharacterBirthDate.fromISOString('2000-01-01'),
    gender: new CharacterGender('male'),
    species: new CharacterSpecies('Human'),
    role: new CharacterRole(role),
  }));
  char.applyStatus(new CharacterStatus());
  return char;
}

describe('Specification evaluation', () => {
  const characters: CharacterAggregate[] = [];
  for (let i = 0; i < 1000; i++) {
    characters.push(createCharacter(String(i), i % 2 === 0 ? 'hero' : 'villain'));
  }

  bench('evaluate AliveSpec on 1000 chars', () => {
    const spec = new AliveSpecification();
    for (const char of characters) {
      spec.isSatisfiedBy(char);
    }
  });

  bench('evaluate chained spec on 1000 chars', () => {
    const spec = new AliveSpecification().and(new PlayableSpecification()).and(new HeroSpecification());
    for (const char of characters) {
      spec.isSatisfiedBy(char);
    }
  });
});
