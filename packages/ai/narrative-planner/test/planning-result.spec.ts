import { describe, it, expect } from 'vitest';
import { PlanningResult } from '../src/planning-result';
import type { CharacterPlan, WorldPlan, TimelinePlan, NarrativePlan, CompositionPlan, PromptPackage } from '../src/planning-context';

const mockCharacterPlan: CharacterPlan = {
  characterId: 'c1', name: 'Hero', role: 'protagonist', arc: 'growth',
  traits: ['brave'], goals: ['save world'], conflicts: [], relationships: [], validated: true,
};

const mockWorldPlan: WorldPlan = {
  worldId: 'w1', name: 'World', regions: [], factions: [], magicSystem: 'none',
  technologyLevel: 'medieval', cultures: [], history: [], validated: true,
};

const mockTimelinePlan: TimelinePlan = {
  timelineId: 't1', name: 'TL', events: [], branches: [], validated: true,
};

const mockNarrativePlan: NarrativePlan = {
  narrativeId: 'n1', title: 'Story', synopsis: '', chapters: [], wordCount: 0, status: 'planned', validated: true,
};

const mockCompositionPlan: CompositionPlan = {
  storyId: 's1', plotStructure: 'three-act', arcs: [], themes: [], conflicts: [], foreshadowing: [], objectives: [], validated: true,
};

const mockPromptPackage: PromptPackage = {
  storyPlan: '', characterProfiles: '', worldBible: '', timelineReference: '',
  compositionGuide: '', styleGuide: '', assembledPrompt: 'Write a story',
};

describe('PlanningResult', () => {
  it('creates with all plans', () => {
    const result = new PlanningResult({
      sessionId: 'session-1',
      storyPlan: { title: 'Test', genre: [], logline: '', premise: '', themes: [], characterCount: 1, worldCount: 1, timelineEvents: 0, narrativeChapters: 0, compositionArcs: 0 },
      characterPlan: mockCharacterPlan,
      worldPlan: mockWorldPlan,
      timelinePlan: mockTimelinePlan,
      narrativePlan: mockNarrativePlan,
      compositionPlan: mockCompositionPlan,
      promptPackage: mockPromptPackage,
      durationMs: 5000,
      stageCount: 8,
    });
    expect(result.sessionId).toBe('session-1');
    expect(result.durationMs).toBe(5000);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it('serializes to JSON', () => {
    const result = new PlanningResult({
      sessionId: 's-json',
      storyPlan: { title: 'JSON Test', genre: [], logline: '', premise: '', themes: [], characterCount: 0, worldCount: 0, timelineEvents: 0, narrativeChapters: 0, compositionArcs: 0 },
      characterPlan: mockCharacterPlan,
      worldPlan: mockWorldPlan,
      timelinePlan: mockTimelinePlan,
      narrativePlan: mockNarrativePlan,
      compositionPlan: mockCompositionPlan,
      promptPackage: mockPromptPackage,
      durationMs: 1000,
      stageCount: 3,
    });
    const json = result.toJSON();
    expect(json.sessionId).toBe('s-json');
    expect(json.storyPlan).toBeDefined();
    expect(json.completedAt).toBeDefined();
  });
});
