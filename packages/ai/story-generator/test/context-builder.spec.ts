import { describe, it, expect } from 'vitest';
import { ContextBuilder } from '../src/prompt/context-builder';
import type { ExecutionResult, StoryDraft, ChapterDraft } from '@storynaram/narrative-execution';

function makeMockResult(): ExecutionResult {
  const draft: StoryDraft = {
    title: 'Test Story',
    chapters: [{ number: 1, title: 'Chapter 1', content: '', wordCount: 0 }, { number: 2, title: 'Chapter 2', content: '', wordCount: 0 }],
    characters: [{ name: 'Hero', role: 'protagonist', introduction: 'A brave hero', dialogue: 'Hello', scenes: ['scene1'] }],
    worlds: [{ name: 'World', regions: ['Region'], description: 'A vast world' }],
    timeline: { events: [{ date: 'Year 1', title: 'Start', narrative: 'The story begins' }], overallTimeline: 'A linear tale' },
    narrative: { synopsis: 'A test', chapters: [] },
    composition: { arcs: [{ name: 'Arc1', content: 'Arc content' }], overallStructure: 'Linear' },
    validationResults: [],
    metadata: { genre: ['fantasy'] },
  };
  return new (class extends ExecutionResult {
    constructor() {
      super({ sessionId: 'test', storyDraft: draft, executionReport: { sessionId: 'test', status: 'completed', stages: [], totalDurationMs: 0, totalTokens: 0, model: 'gpt-4' }, validationReport: { passed: true, validations: [], summary: '' }, statistics: { totalTasks: 1, completedTasks: 1, failedTasks: 0, totalDurationMs: 0, totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, agentTimings: [], stageTimings: [] } });
    }
  })();
}

describe('ContextBuilder', () => {
  it('builds context for a chapter', () => {
    const builder = new ContextBuilder();
    const result = makeMockResult();
    const chapter = result.storyDraft.chapters[0]!;

    const context = builder.buildForChapter(result, chapter, 'Previous content');

    expect(context.storyDraft.title).toBe('Test Story');
    expect(context.chapter.title).toBe('Chapter 1');
    expect(context.previousContent).toBe('Previous content');
    expect(context.characterContext).toContain('Hero');
    expect(context.worldContext).toContain('World');
    expect(context.timelineContext).toContain('Year 1');
    expect(context.compositionContext).toContain('Arc1');
  });

  it('builds full story context', () => {
    const builder = new ContextBuilder();
    const result = makeMockResult();

    const context = builder.buildFullContext(result);

    expect(context.storyDraft.title).toBe('Test Story');
    expect(context.chapter).toBeDefined();
    expect(context.characterContext).toContain('Hero');
  });

  it('returns empty strings for missing data', () => {
    const builder = new ContextBuilder();
    const emptyDraft: StoryDraft = {
      title: 'Empty', chapters: [], characters: [], worlds: [],
      timeline: { events: [], overallTimeline: '' },
      narrative: { synopsis: '', chapters: [] },
      composition: { arcs: [], overallStructure: '' },
      validationResults: [], metadata: {},
    };
    const result = makeMockResult();
    (result.storyDraft as StoryDraft).characters = [];
    (result.storyDraft as StoryDraft).worlds = [];

    const context = builder.buildFullContext(result);

    expect(context.characterContext).toBe('No characters defined.');
    expect(context.worldContext).toBe('No world settings defined.');
  });
});
