import { describe, it, expect } from 'vitest';
import { StoryArc, ArcCollection, ArcGoal, ArcResolution, ArcTransition } from '../src/story-arc';
import { CharacterArc, CharacterArcCollection, CharacterGoal, CharacterConflict, CharacterGrowth, CharacterTransformation, CharacterResolution } from '../src/character-arc';

describe('ArcGoal', () => {
  it('creates with description', () => {
    const g = new ArcGoal('Defeat the villain');
    expect(g.description).toBe('Defeat the villain');
  });

  it('throws on empty description', () => {
    expect(() => new ArcGoal('')).toThrow();
  });

  it('achieved returns marked goal', () => {
    const g = new ArcGoal('Win').achieved();
    expect(g.isAchieved).toBe(true);
  });
});

describe('ArcResolution', () => {
  it('creates with defaults', () => {
    const r = new ArcResolution();
    expect(r.resolutionType).toBe('ambiguous');
  });
});

describe('ArcTransition', () => {
  it('creates with from/to', () => {
    const t = new ArcTransition('introduction', 'rising', 'catalyst');
    expect(t.fromStage).toBe('introduction');
    expect(t.toStage).toBe('rising');
  });

  it('throws on same stage', () => {
    expect(() => new ArcTransition('climax', 'climax')).toThrow();
  });
});

describe('StoryArc', () => {
  it('creates with required props', () => {
    const arc = new StoryArc('arc-1', 'Hero Journey');
    expect(arc.arcId).toBe('arc-1');
    expect(arc.name).toBe('Hero Journey');
  });

  it('throws on empty arc ID', () => {
    expect(() => new StoryArc('', 'Name')).toThrow();
  });

  it('throws on empty name', () => {
    expect(() => new StoryArc('id', '')).toThrow();
  });
});

describe('ArcCollection', () => {
  it('adds and retrieves arcs', () => {
    const c = new ArcCollection([new StoryArc('a1', 'Arc 1')]);
    expect(c.count).toBe(1);
    expect(c.has('a1')).toBe(true);
  });

  it('filters by stage', () => {
    const c = new ArcCollection([
      new StoryArc('a1', 'Arc 1', 'introduction'),
      new StoryArc('a2', 'Arc 2', 'completed'),
    ]);
    expect(c.completed()).toHaveLength(1);
  });
});

describe('CharacterGoal', () => {
  it('creates with description', () => {
    const g = new CharacterGoal('Find the artifact');
    expect(g.description).toBe('Find the artifact');
  });

  it('throws on empty description', () => {
    expect(() => new CharacterGoal('')).toThrow();
  });
});

describe('CharacterGrowth', () => {
  it('creates with defaults', () => {
    const g = new CharacterGrowth();
    expect(g.growthType).toBe('static');
  });

  it('throws on invalid magnitude', () => {
    expect(() => new CharacterGrowth('positive', 'grown', 11)).toThrow();
    expect(() => new CharacterGrowth('positive', 'grown', -1)).toThrow();
  });
});

describe('CharacterArc', () => {
  it('creates with required props', () => {
    const arc = new CharacterArc('ca-1', 'char-1');
    expect(arc.characterArcId).toBe('ca-1');
    expect(arc.characterId).toBe('char-1');
  });

  it('throws on empty ID', () => {
    expect(() => new CharacterArc('', 'char-1')).toThrow();
  });

  it('throws on empty character ID', () => {
    expect(() => new CharacterArc('ca-1', '')).toThrow();
  });
});

describe('CharacterArcCollection', () => {
  it('groups by character', () => {
    const c = new CharacterArcCollection([
      new CharacterArc('ca-1', 'char-1'),
      new CharacterArc('ca-2', 'char-1'),
      new CharacterArc('ca-3', 'char-2'),
    ]);
    expect(c.ofCharacter('char-1')).toHaveLength(2);
  });
});
