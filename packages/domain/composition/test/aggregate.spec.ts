import { describe, it, expect } from 'vitest';
import { StoryAggregate } from '../src/story-aggregate';
import { StoryIdentity } from '../src/story-identity';

describe('StoryAggregate', () => {
  it('creates with identity', () => {
    const s = new StoryAggregate(StoryIdentity.create());
    expect(s.identity).toBeDefined();
  });

  it('initializes with title', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('My Story', 'novel');
    expect(s.profile.title).toBe('My Story');
    expect(s.profile.format).toBe('novel');
    expect(s.state.phase).toBe('concept');
    expect(s.domainEvents.some(e => e.eventType === 'story.created')).toBe(true);
  });

  it('setPhase updates state', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPhase('development');
    expect(s.state.phase).toBe('development');
  });

  it('setPlot creates plot and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPlot('heroJourney', 'linear', 'Hero story');
    expect(s.plot.structure).toBe('heroJourney');
    expect(s.plot.plotType).toBe('linear');
    expect(s.domainEvents.some(e => e.eventType === 'story.plot.created')).toBe(true);
  });

  it('addPlotPoint adds and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPlot('threeAct');
    s.addPlotPoint('pp-1', 'setup', 'ch-1', 'sc-1', 'Start', 'Beginning', 1);
    expect(s.plot.points.count).toBe(1);
    expect(s.plot.points.get('pp-1')?.stage).toBe('setup');
    expect(s.domainEvents.some(e => e.eventType === 'story.plot.point.added')).toBe(true);
  });

  it('addArc adds and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addArc('arc-1', 'Main Arc', 'introduction');
    expect(s.arcs.count).toBe(1);
    expect(s.arcs.get('arc-1')?.name).toBe('Main Arc');
    expect(s.domainEvents.some(e => e.eventType === 'story.arc.created')).toBe(true);
  });

  it('addCharacterArc adds and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addCharacterArc('ca-1', 'char-1');
    expect(s.characterArcs.count).toBe(1);
    expect(s.domainEvents.some(e => e.eventType === 'story.characterArc.created')).toBe(true);
  });

  it('addConflict adds and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addConflict('c-1', 'characterVsCharacter', 'Hero vs Villain', 'major', ['hero', 'villain']);
    expect(s.conflicts.count).toBe(1);
    expect(s.conflicts.get('c-1')?.category).toBe('characterVsCharacter');
    expect(s.domainEvents.some(e => e.eventType === 'story.conflict.added')).toBe(true);
  });

  it('resolveConflict resolves and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addConflict('c-1', 'characterVsCharacter', 'Fight', 'major', ['a', 'b']);
    s.resolveConflict('c-1', 'Hero wins', 'hero', 'Peace restored');
    expect(s.conflicts.get('c-1')?.state).toBe('resolved');
    expect(s.conflicts.get('c-1')?.resolution.resolved).toBe(true);
    expect(s.domainEvents.some(e => e.eventType === 'story.conflict.resolved')).toBe(true);
  });

  it('resolveConflict throws on unknown', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(() => s.resolveConflict('ghost', 'nothing')).toThrow();
  });

  it('addTheme adds and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addTheme('th-1', 'love', 'Love conquers all');
    expect(s.themes.count).toBe(1);
    expect(s.domainEvents.some(e => e.eventType === 'story.theme.added')).toBe(true);
  });

  it('addForeshadow adds and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addForeshadow('fs-1', 'Storm coming', 'subtle', 'ch-1', 'sc-1');
    expect(s.foreshadows.count).toBe(1);
    expect(s.domainEvents.some(e => e.eventType === 'story.foreshadow.added')).toBe(true);
  });

  it('addPayoff resolves foreshadow and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addForeshadow('fs-1', 'Storm coming', 'obvious', 'ch-1', 'sc-1');
    s.addPayoff('po-1', 'fs-1', 'Storm arrives', 'ch-3', 'sc-5');
    expect(s.payoffs.count).toBe(1);
    expect(s.foreshadows.get('fs-1')?.payoff.isPaidOff).toBe(true);
    expect(s.domainEvents.some(e => e.eventType === 'story.payoff.resolved')).toBe(true);
  });

  it('addPayoff throws on unknown foreshadow', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(() => s.addPayoff('po-1', 'ghost', 'desc')).toThrow();
  });

  it('addStoryObjective adds objective', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addStoryObjective('so-1', 'Complete the quest', 'high');
    expect(s.objectives.storyObjectives).toHaveLength(1);
  });

  it('addSceneObjective adds scene objective', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addSceneObjective('so-1', 'sc-1', 'Rescue the hostage');
    expect(s.objectives.sceneObjectives).toHaveLength(1);
  });

  it('addCharacterObjective adds character objective', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addCharacterObjective('co-1', 'char-1', 'Find the map');
    expect(s.objectives.characterObjectives).toHaveLength(1);
  });

  it('addWorldObjective adds world objective', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.addWorldObjective('wo-1', 'world-1', 'Restore balance');
    expect(s.objectives.worldObjectives).toHaveLength(1);
  });

  it('complete marks complete and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.complete();
    expect(s.state.isComplete).toBe(true);
    expect(s.domainEvents.some(e => e.eventType === 'story.completed')).toBe(true);
  });

  it('publish marks published and emits event', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.publish();
    expect(s.state.isPublished).toBe(true);
    expect(s.domainEvents.some(e => e.eventType === 'story.published')).toBe(true);
  });

  it('archive marks archived', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.archive();
    expect(s.state.isArchived).toBe(true);
  });

  it('statistics update after adding elements', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPlot('threeAct');
    s.addPlotPoint('pp-1', 'setup', 'ch-1', 'sc-1', 'Start', '', 1);
    s.addArc('arc-1', 'Main Arc');
    s.addConflict('c-1', 'characterVsCharacter', 'Fight', 'major', ['a', 'b']);
    s.addTheme('th-1', 'love', 'Love wins');
    s.addForeshadow('fs-1', 'Clue', 'subtle', 'ch-1', 'sc-1');
    expect(s.statistics.totalPlotPoints).toBe(1);
    expect(s.statistics.totalArcs).toBe(1);
    expect(s.statistics.totalConflicts).toBe(1);
    expect(s.statistics.totalThemes).toBe(1);
    expect(s.statistics.totalForeshadows).toBe(1);
  });

  it('toJSON returns serializable structure', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    const json = s.toJSON();
    expect(json.identity).toBe('1');
    expect(json.profile).toBeDefined();
    expect(json.plot).toBeDefined();
    expect(json.arcs).toBeDefined();
    expect(json.conflicts).toBeDefined();
    expect(json.themes).toBeDefined();
  });
});
