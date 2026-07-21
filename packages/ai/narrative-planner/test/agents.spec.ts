import { describe, it, expect } from 'vitest';
import { IdeaAgent } from '../src/agents/idea-agent';
import { CharacterAgent } from '../src/agents/character-agent';
import { WorldAgent } from '../src/agents/world-agent';
import { TimelineAgent } from '../src/agents/timeline-agent';
import { CanonAgent } from '../src/agents/canon-agent';
import { NarrativeAgent } from '../src/agents/narrative-agent';
import { CompositionAgent } from '../src/agents/composition-agent';
import { ValidationAgent } from '../src/agents/validation-agent';
import { PlanningContext } from '../src/planning-context';
import { PlanningSession } from '../src/planning-session';
import type { StoryIdea } from '../src/planning-context';

const sampleIdea: StoryIdea = {
  title: 'The Crystal King',
  genre: ['fantasy', 'epic'],
  logline: 'A young orphan discovers he is the last heir to a fallen kingdom and must unite the fractured realm against an ancient evil.',
  premise: 'Magic flows through the bloodlines of the realm',
  themes: ['destiny', 'sacrifice', 'unity'],
  tone: 'epic',
  targetAudience: 'young-adult',
  wordCountGoal: 100000,
};

function createContext(): PlanningContext {
  return new PlanningContext(sampleIdea);
}

function createSession(): PlanningSession {
  return new PlanningSession('test-session', createContext());
}

describe('IdeaAgent', () => {
  it('analyzes story idea', async () => {
    const agent = new IdeaAgent();
    const ctx = createContext();
    const session = createSession();
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.metadata['ideaAnalysis']).toBeDefined();
  });

  it('suggests characters from logline', async () => {
    const agent = new IdeaAgent();
    const ctx = createContext();
    const result = await agent.execute(ctx, createSession());
    expect(result.success).toBe(true);
  });
});

describe('CharacterAgent', () => {
  it('creates character plan from idea', async () => {
    const agent = new CharacterAgent();
    const ctx = createContext();
    const session = createSession();
    await new IdeaAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.characterPlan).not.toBeNull();
    expect(ctx.characterPlan!.name).toBeDefined();
  });
});

describe('WorldAgent', () => {
  it('creates world plan', async () => {
    const agent = new WorldAgent();
    const ctx = createContext();
    const result = await agent.execute(ctx, createSession());
    expect(result.success).toBe(true);
    expect(ctx.worldPlan).not.toBeNull();
    expect(ctx.worldPlan!.name).toBe('The Crystal King');
  });

  it('detects fantasy genre for magic system', async () => {
    const agent = new WorldAgent();
    const ctx = createContext();
    await agent.execute(ctx, createSession());
    expect(ctx.worldPlan!.magicSystem).toBe('elemental');
  });
});

describe('TimelineAgent', () => {
  it('creates timeline events', async () => {
    const agent = new TimelineAgent();
    const ctx = createContext();
    const session = createSession();
    await new IdeaAgent().execute(ctx, session);
    await new CharacterAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.timelinePlan).not.toBeNull();
    expect(ctx.timelinePlan!.events.length).toBeGreaterThanOrEqual(3);
  });
});

describe('CanonAgent', () => {
  it('validates with existing plans', async () => {
    const agent = new CanonAgent();
    const ctx = createContext();
    const session = createSession();
    await new IdeaAgent().execute(ctx, session);
    await new CharacterAgent().execute(ctx, session);
    await new WorldAgent().execute(ctx, session);
    await new TimelineAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.canon.length).toBeGreaterThan(0);
  });

  it('fails when plans are missing', async () => {
    const agent = new CanonAgent();
    const ctx = createContext();
    const result = await agent.execute(ctx, createSession());
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('NarrativeAgent', () => {
  it('creates chapters', async () => {
    const agent = new NarrativeAgent();
    const ctx = createContext();
    const session = createSession();
    ctx.metadata['ideaWordCount'] = 100000;
    await new IdeaAgent().execute(ctx, session);
    await new CharacterAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.narrativePlan).not.toBeNull();
    expect(ctx.narrativePlan!.chapters.length).toBeGreaterThanOrEqual(3);
  });
});

describe('CompositionAgent', () => {
  it('creates composition with arcs and themes', async () => {
    const agent = new CompositionAgent();
    const ctx = createContext();
    const session = createSession();
    await new IdeaAgent().execute(ctx, session);
    await new CharacterAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.compositionPlan).not.toBeNull();
    expect(ctx.compositionPlan!.themes).toContain('destiny');
    expect(ctx.compositionPlan!.arcs.length).toBeGreaterThanOrEqual(1);
  });
});

describe('ValidationAgent', () => {
  it('assembles prompt when all plans present', async () => {
    const agent = new ValidationAgent();
    const ctx = createContext();
    const session = createSession();
    await new IdeaAgent().execute(ctx, session);
    await new CharacterAgent().execute(ctx, session);
    await new WorldAgent().execute(ctx, session);
    await new TimelineAgent().execute(ctx, session);
    await new CanonAgent().execute(ctx, session);
    await new NarrativeAgent().execute(ctx, session);
    await new CompositionAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(true);
    expect(ctx.promptPackage).not.toBeNull();
    expect(ctx.promptPackage!.assembledPrompt).toContain('The Crystal King');
  });

  it('reports warnings for missing objectives', async () => {
    const agent = new ValidationAgent();
    const ctx = createContext();
    const session = createSession();
    await new IdeaAgent().execute(ctx, session);
    await new WorldAgent().execute(ctx, session);
    await new TimelineAgent().execute(ctx, session);
    await new CanonAgent().execute(ctx, session);
    const result = await agent.execute(ctx, session);
    expect(result.success).toBe(false);
  });
});
