import { describe, it, expect } from 'vitest';
import { StoryObjective, SceneObjective, CharacterObjective, WorldObjective, ObjectiveCollection } from '../src/objectives';

describe('StoryObjective', () => {
  it('creates with required props', () => {
    const o = new StoryObjective('so-1', 'Complete the quest');
    expect(o.objectiveId).toBe('so-1');
    expect(o.status).toBe('pending');
  });

  it('throws on empty ID', () => {
    expect(() => new StoryObjective('', 'desc')).toThrow();
  });

  it('throws on empty description', () => {
    expect(() => new StoryObjective('so-1', '')).toThrow();
  });

  it('withStatus returns new objective', () => {
    const o = new StoryObjective('so-1', 'Quest').withStatus('achieved');
    expect(o.status).toBe('achieved');
  });
});

describe('SceneObjective', () => {
  it('creates with required props', () => {
    const o = new SceneObjective('so-1', 'sc-1', 'Rescue');
    expect(o.sceneId).toBe('sc-1');
  });
});

describe('CharacterObjective', () => {
  it('creates with required props', () => {
    const o = new CharacterObjective('co-1', 'char-1', 'Find treasure');
    expect(o.characterId).toBe('char-1');
  });
});

describe('WorldObjective', () => {
  it('creates with required props', () => {
    const o = new WorldObjective('wo-1', 'world-1', 'Restore balance');
    expect(o.worldId).toBe('world-1');
  });
});

describe('ObjectiveCollection', () => {
  it('manages all objective types', () => {
    const c = new ObjectiveCollection(
      [new StoryObjective('so-1', 'Story goal')],
      [new SceneObjective('sco-1', 'sc-1', 'Scene goal')],
      [new CharacterObjective('co-1', 'char-1', 'Char goal')],
      [new WorldObjective('wo-1', 'world-1', 'World goal')],
    );
    expect(c.totalCount).toBe(4);
    expect(c.storyObjectives).toHaveLength(1);
    expect(c.sceneObjectives).toHaveLength(1);
    expect(c.characterObjectives).toHaveLength(1);
    expect(c.worldObjectives).toHaveLength(1);
  });

  it('tracks achieved objectives', () => {
    const c = new ObjectiveCollection(
      [new StoryObjective('so-1', 'Goal').withStatus('achieved')],
      [new SceneObjective('sco-1', 'sc-1', 'Not done')],
    );
    expect(c.achieved()).toBe(1);
  });
});
