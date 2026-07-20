import { describe, it, expect } from 'vitest';
import { CharacterName, CharacterAge, CharacterGender, CharacterSpecies, CharacterRole, CharacterBirthDate } from '../src/character-profile';
import { CharacterAppearance } from '../src/character-appearance';
import { CharacterTraits, CharacterAlignment } from '../src/character-personality';
import { CharacterEmotion, PrimaryEmotion } from '../src/character-emotion';
import { CharacterStatus, LifeStage, Consciousness } from '../src/character-status';
import { CharacterStatistics } from '../src/character-statistics';
import { CharacterAbilities } from '../src/character-abilities';

describe('CharacterName', () => {
  it('creates with first and last name', () => {
    const name = new CharacterName('John', 'Doe');
    expect(name.fullName).toBe('John Doe');
    expect(name.displayName).toBe('John');
  });

  it('includes middle name in fullName', () => {
    const name = new CharacterName('John', 'Doe', 'Michael');
    expect(name.fullName).toBe('John Michael Doe');
  });

  it('uses nickName as displayName', () => {
    const name = new CharacterName('John', 'Doe', undefined, 'Johnny');
    expect(name.displayName).toBe('Johnny');
  });

  it('equals same values', () => {
    const a = new CharacterName('John', 'Doe');
    const b = new CharacterName('John', 'Doe');
    expect(a.equals(b)).toBe(true);
  });

  it('not equals different names', () => {
    const a = new CharacterName('John', 'Doe');
    const b = new CharacterName('Jane', 'Doe');
    expect(a.equals(b)).toBe(false);
  });
});

describe('CharacterAge', () => {
  it('creates with valid age', () => {
    const age = new CharacterAge(25);
    expect(age.value).toBe(25);
  });

  it('throws on negative age', () => {
    expect(() => new CharacterAge(-1)).toThrow();
  });

  it('throws on excessive age', () => {
    expect(() => new CharacterAge(1001)).toThrow();
  });
});

describe('CharacterBirthDate', () => {
  it('creates from ISO string', () => {
    const bd = CharacterBirthDate.fromISOString('1990-01-01');
    expect(bd.value).toBeInstanceOf(Date);
  });

  it('throws on future date', () => {
    const future = new Date(Date.now() + 10000000000);
    expect(() => new CharacterBirthDate(future)).toThrow();
  });
});

describe('CharacterGender', () => {
  it('creates with value', () => {
    const gender = new CharacterGender('male');
    expect(gender.value).toBe('male');
  });

  it('throws on empty string', () => {
    expect(() => new CharacterGender('')).toThrow();
  });
});

describe('CharacterSpecies', () => {
  it('creates with value', () => {
    const sp = new CharacterSpecies('Human');
    expect(sp.value).toBe('Human');
  });

  it('throws on empty', () => {
    expect(() => new CharacterSpecies('')).toThrow();
  });
});

describe('CharacterRole', () => {
  it('creates with value', () => {
    const role = new CharacterRole('hero');
    expect(role.value).toBe('hero');
  });

  it('throws on empty', () => {
    expect(() => new CharacterRole('')).toThrow();
  });
});

describe('CharacterAppearance', () => {
  it('creates with defaults', () => {
    const app = new CharacterAppearance();
    expect(app.height).toBe(0);
    expect(app.distinguishingFeatures).toEqual([]);
  });

  it('creates with props', () => {
    const app = new CharacterAppearance({ height: 180, hairColor: 'brown', distinguishingFeatures: ['scar'] });
    expect(app.height).toBe(180);
    expect(app.hairColor).toBe('brown');
    expect(app.distinguishingFeatures).toContain('scar');
  });
});

describe('CharacterTraits', () => {
  it('creates with traits', () => {
    const t = new CharacterTraits(['brave', 'kind']);
    expect(t.values).toHaveLength(2);
  });

  it('checks trait existence', () => {
    const t = new CharacterTraits(['brave']);
    expect(t.has('brave')).toBe(true);
    expect(t.has('cowardly')).toBe(false);
  });
});

describe('CharacterAlignment', () => {
  it('creates lawful good', () => {
    const a = CharacterAlignment.lawfulGood();
    expect(a.label).toBe('lawful good');
  });

  it('creates chaotic evil', () => {
    const a = CharacterAlignment.chaoticEvil();
    expect(a.label).toBe('chaotic evil');
  });
});

describe('CharacterEmotion', () => {
  it('creates with primary emotion', () => {
    const e = new CharacterEmotion(PrimaryEmotion.JOY);
    expect(e.primary).toBe(PrimaryEmotion.JOY);
  });

  it('throws on invalid intensity', () => {
    expect(() => new CharacterEmotion(PrimaryEmotion.JOY, 1.5)).toThrow();
  });

  it('detects intense emotions', () => {
    const e = new CharacterEmotion(PrimaryEmotion.ANGER, 0.9);
    expect(e.isIntense()).toBe(true);
  });
});

describe('CharacterStatus', () => {
  it('defaults to alive and playable', () => {
    const s = new CharacterStatus();
    expect(s.isAlive).toBe(true);
    expect(s.isPlayable).toBe(true);
  });

  it('kill returns dead status', () => {
    const s = new CharacterStatus();
    const dead = s.kill();
    expect(dead.isAlive).toBe(false);
    expect(dead.consciousness).toBe(Consciousness.INCAPACITATED);
  });
});

describe('CharacterStatistics', () => {
  it('defaults to level 1', () => {
    const s = new CharacterStatistics();
    expect(s.level).toBe(1);
    expect(s.maxHealth).toBe(100);
  });

  it('takeDamage reduces health', () => {
    const s = new CharacterStatistics();
    const damaged = s.takeDamage(30);
    expect(damaged.health).toBe(70);
  });

  it('heal restores health', () => {
    const s = new CharacterStatistics().takeDamage(50);
    const healed = s.heal(25);
    expect(healed.health).toBe(75);
  });

  it('levelUp on sufficient XP', () => {
    const s = new CharacterStatistics({ experiencePoints: 950 });
    const leveled = s.addExperience(100);
    expect(leveled.level).toBe(2);
  });
});

describe('CharacterAbilities', () => {
  it('defaults to 10', () => {
    const a = new CharacterAbilities();
    expect(a.strength).toBe(10);
    expect(a.charisma).toBe(10);
  });

  it('calculates modifiers', () => {
    const a = new CharacterAbilities({ strength: 14 });
    expect(a.strengthModifier).toBe(2);
  });
});
