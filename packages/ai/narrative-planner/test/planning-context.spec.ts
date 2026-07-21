import { describe, it, expect } from 'vitest';
import { PlanningContext } from '../src/planning-context';
import type { StoryIdea } from '../src/planning-context';

const sampleIdea: StoryIdea = {
  title: 'Test Tale',
  genre: ['fantasy', 'adventure'],
  logline: 'An epic adventure',
  premise: 'A world awaits',
  themes: ['courage', 'friendship'],
  tone: 'heroic',
  targetAudience: 'young-adult',
  wordCountGoal: 90000,
};

describe('PlanningContext', () => {
  it('creates from story idea', () => {
    const ctx = new PlanningContext(sampleIdea);
    expect(ctx.idea.title).toBe('Test Tale');
    expect(ctx.idea.genre).toContain('fantasy');
  });

  it('starts with no plans', () => {
    const ctx = new PlanningContext(sampleIdea);
    expect(ctx.characterPlan).toBeNull();
    expect(ctx.worldPlan).toBeNull();
    expect(ctx.isComplete()).toBe(false);
  });

  it('tracks completed stages', () => {
    const ctx = new PlanningContext(sampleIdea);
    expect(ctx.getCompletedStages()).toHaveLength(0);
    ctx.characterPlan = { characterId: '1', name: 'Hero', role: 'protagonist', arc: '', traits: [], goals: [], conflicts: [], relationships: [], validated: false };
    expect(ctx.getCompletedStages()).toContain('character');
  });

  it('checks completeness with all plans', () => {
    const ctx = new PlanningContext(sampleIdea);
    ctx.characterPlan = { characterId: '1', name: 'Hero', role: '', arc: '', traits: [], goals: [], conflicts: [], relationships: [], validated: true };
    ctx.worldPlan = { worldId: '1', name: 'World', regions: [], factions: [], magicSystem: '', technologyLevel: '', cultures: [], history: [], validated: true };
    ctx.timelinePlan = { timelineId: '1', name: 'TL', events: [], branches: [], validated: true };
    ctx.narrativePlan = { narrativeId: '1', title: 'T', synopsis: '', chapters: [], wordCount: 0, status: '', validated: true };
    ctx.compositionPlan = { storyId: '1', plotStructure: '', arcs: [], themes: [], conflicts: [], foreshadowing: [], objectives: [], validated: true };
    expect(ctx.isComplete()).toBe(true);
  });

  it('stores metadata', () => {
    const ctx = new PlanningContext(sampleIdea);
    ctx.metadata['key'] = 'value';
    expect(ctx.metadata['key']).toBe('value');
  });

  it('tracks validation errors', () => {
    const ctx = new PlanningContext(sampleIdea);
    ctx.validationErrors.push('Conflict detected');
    expect(ctx.validationErrors).toHaveLength(1);
  });
});
