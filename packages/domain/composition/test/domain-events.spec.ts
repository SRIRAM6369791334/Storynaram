import { describe, it, expect } from 'vitest';
import {
  StoryCreatedEvent, PlotCreatedEvent, PlotPointAddedEvent,
  ArcCreatedEvent, CharacterArcCreatedEvent,
  ConflictAddedEvent, ConflictResolvedEvent,
  ThemeAddedEvent, ForeshadowAddedEvent, PayoffResolvedEvent,
  StoryCompletedEvent, StoryPublishedEvent,
} from '../src/story-events';

describe('StoryCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new StoryCreatedEvent('story-1', { title: 'My Story', format: 'novel' });
    expect(event.eventType).toBe('story.created');
    expect(event.aggregateId).toBe('story-1');
    expect(event.payload.title).toBe('My Story');
  });
});

describe('PlotCreatedEvent', () => {
  it('creates with event info', () => {
    const event = new PlotCreatedEvent('story-1', { plotId: 'plot-1', structure: 'threeAct', plotType: 'linear' });
    expect(event.eventType).toBe('story.plot.created');
    expect(event.payload.plotId).toBe('plot-1');
  });
});

describe('PlotPointAddedEvent', () => {
  it('creates with event info', () => {
    const event = new PlotPointAddedEvent('story-1', { pointId: 'pp-1', stage: 'setup', order: 1, title: 'Start' });
    expect(event.eventType).toBe('story.plot.point.added');
    expect(event.payload.pointId).toBe('pp-1');
  });
});

describe('ArcCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new ArcCreatedEvent('story-1', { arcId: 'arc-1', name: 'Main Arc', stage: 'introduction' });
    expect(event.eventType).toBe('story.arc.created');
    expect(event.payload.arcId).toBe('arc-1');
  });
});

describe('CharacterArcCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new CharacterArcCreatedEvent('story-1', { characterArcId: 'ca-1', characterId: 'char-1' });
    expect(event.eventType).toBe('story.characterArc.created');
    expect(event.payload.characterId).toBe('char-1');
  });
});

describe('ConflictAddedEvent', () => {
  it('creates with payload', () => {
    const event = new ConflictAddedEvent('story-1', { conflictId: 'c-1', category: 'characterVsCharacter', severity: 'major', description: 'Fight' });
    expect(event.eventType).toBe('story.conflict.added');
    expect(event.payload.conflictId).toBe('c-1');
  });
});

describe('ConflictResolvedEvent', () => {
  it('creates with payload', () => {
    const event = new ConflictResolvedEvent('story-1', { conflictId: 'c-1', resolution: 'Hero wins' });
    expect(event.eventType).toBe('story.conflict.resolved');
    expect(event.payload.resolution).toBe('Hero wins');
  });
});

describe('ThemeAddedEvent', () => {
  it('creates with payload', () => {
    const event = new ThemeAddedEvent('story-1', { themeId: 'th-1', category: 'love', statement: 'Love wins' });
    expect(event.eventType).toBe('story.theme.added');
    expect(event.payload.themeId).toBe('th-1');
  });
});

describe('ForeshadowAddedEvent', () => {
  it('creates with payload', () => {
    const event = new ForeshadowAddedEvent('story-1', { foreshadowId: 'fs-1', clue: 'Storm coming', strength: 'obvious' });
    expect(event.eventType).toBe('story.foreshadow.added');
    expect(event.payload.foreshadowId).toBe('fs-1');
  });
});

describe('PayoffResolvedEvent', () => {
  it('creates with payload', () => {
    const event = new PayoffResolvedEvent('story-1', { payoffId: 'po-1', foreshadowId: 'fs-1' });
    expect(event.eventType).toBe('story.payoff.resolved');
    expect(event.payload.payoffId).toBe('po-1');
  });
});

describe('StoryCompletedEvent', () => {
  it('creates with payload', () => {
    const event = new StoryCompletedEvent('story-1', { title: 'My Story' });
    expect(event.eventType).toBe('story.completed');
    expect(event.payload.title).toBe('My Story');
  });
});

describe('StoryPublishedEvent', () => {
  it('creates with payload', () => {
    const event = new StoryPublishedEvent('story-1', { title: 'My Story' });
    expect(event.eventType).toBe('story.published');
    expect(event.payload.title).toBe('My Story');
  });
});
