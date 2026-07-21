import { describe, it, expect } from 'vitest';
import { NarrativePlanGeneratedEvent, PlanningStageCompletedEvent, PlanningFailedEvent, assemblePromptPackage } from '../src/integration';
import { PlanningResult } from '../src/planning-result';
import type { CharacterPlan, WorldPlan, TimelinePlan, NarrativePlan, CompositionPlan, PromptPackage } from '../src/planning-context';

const mockCharacterPlan: CharacterPlan = {
  characterId: 'c1', name: 'Aria', role: 'protagonist', arc: 'transformation',
  traits: ['curious', 'brave'], goals: ['Find the truth'], conflicts: [], relationships: [], validated: true,
};

const mockWorldPlan: WorldPlan = {
  worldId: 'w1', name: 'Eldoria', regions: ['Forest'], factions: [], magicSystem: 'elemental',
  technologyLevel: 'medieval', cultures: [], history: [], validated: true,
};

const mockTimelinePlan: TimelinePlan = {
  timelineId: 't1', name: 'TL', events: [{ date: 'Day 1', title: 'Start', description: 'Begin', type: 'event' }], branches: [], validated: true,
};

const mockNarrativePlan: NarrativePlan = {
  narrativeId: 'n1', title: 'The Quest', synopsis: 'Aria seeks the truth', chapters: [{ number: 1, title: 'Ch1', summary: 'Begin', scenes: [] }], wordCount: 50000, status: 'planned', validated: true,
};

const mockCompositionPlan: CompositionPlan = {
  storyId: 's1', plotStructure: 'three-act', arcs: [{ name: 'Main', description: 'Plot', beats: [] }], themes: ['truth'], conflicts: [], foreshadowing: [], objectives: [], validated: true,
};

const mockPromptPackage: PromptPackage = {
  storyPlan: 'Story', characterProfiles: 'Aria', worldBible: 'Eldoria', timelineReference: 'Day 1',
  compositionGuide: 'Three act', styleGuide: 'Epic', assembledPrompt: 'Write the story of Aria',
};

describe('Integration Events', () => {
  it('creates plan generated event', () => {
    const result = new PlanningResult({
      sessionId: 's1',
      storyPlan: { title: 'T', genre: [], logline: '', premise: '', themes: [], characterCount: 1, worldCount: 1, timelineEvents: 1, narrativeChapters: 1, compositionArcs: 1 },
      characterPlan: mockCharacterPlan,
      worldPlan: mockWorldPlan,
      timelinePlan: mockTimelinePlan,
      narrativePlan: mockNarrativePlan,
      compositionPlan: mockCompositionPlan,
      promptPackage: mockPromptPackage,
      durationMs: 100,
      stageCount: 8,
    });
    const event = new NarrativePlanGeneratedEvent('plan-1', { planId: 'plan-1', result });
    expect(event.eventType).toBe('narrative.plan.generated');
    expect(event.aggregateId).toBe('plan-1');
  });

  it('creates stage completed event', () => {
    const event = new PlanningStageCompletedEvent('session-1', { sessionId: 'session-1', stage: 'idea-analysis', durationMs: 500 });
    expect(event.eventType).toBe('narrative.planning.stage.completed');
    expect(event.payload.stage).toBe('idea-analysis');
  });

  it('creates failed event', () => {
    const event = new PlanningFailedEvent('session-1', { sessionId: 'session-1', error: 'Missing plan', stage: 'canon-validation' });
    expect(event.eventType).toBe('narrative.planning.failed');
    expect(event.payload.error).toBe('Missing plan');
  });
});

describe('assemblePromptPackage', () => {
  it('assembles full prompt from result', () => {
    const result = new PlanningResult({
      sessionId: 's1',
      storyPlan: { title: 'The Quest', genre: ['fantasy'], logline: 'Aria seeks truth', premise: '', themes: ['truth'], characterCount: 1, worldCount: 1, timelineEvents: 1, narrativeChapters: 1, compositionArcs: 1 },
      characterPlan: mockCharacterPlan,
      worldPlan: mockWorldPlan,
      timelinePlan: mockTimelinePlan,
      narrativePlan: mockNarrativePlan,
      compositionPlan: mockCompositionPlan,
      promptPackage: mockPromptPackage,
      durationMs: 100,
      stageCount: 8,
    });
    const prompt = assemblePromptPackage(result);
    expect(prompt).toContain('The Quest');
    expect(prompt).toContain('Aria');
    expect(prompt).toContain('Eldoria');
    expect(prompt).toContain('three-act');
  });
});
