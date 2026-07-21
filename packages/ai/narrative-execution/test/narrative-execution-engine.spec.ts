import { describe, it, expect, vi } from 'vitest';
import { NarrativeExecutionEngine } from '../src/narrative-execution-engine';
import { PlanningResult } from '@storynaram/narrative-planner';
import type { AIRequest, AIGenerateOptions, AIResponse } from '@storynaram/runtime';

function makeMockResult(): PlanningResult {
  return new PlanningResult({
    sessionId: 'plan-1',
    storyPlan: { title: 'The Last Kingdom', genre: ['fantasy'], logline: 'A fallen hero must rise again', premise: 'In a world of magic...', themes: ['redemption', 'power'], characterCount: 1, worldCount: 1, timelineEvents: 2, narrativeChapters: 1, compositionArcs: 1 },
    characterPlan: { characterId: 'c1', name: 'Kael', role: 'protagonist', arc: 'redemption', traits: ['brave'], goals: ['defeat dark lord'], conflicts: ['inner doubt'], relationships: [], validated: true },
    worldPlan: { worldId: 'w1', name: 'Eldoria', regions: ['Northern Plains'], factions: ['The Council'], magicSystem: 'Elemental', technologyLevel: 'Medieval', cultures: ['Eldorian'], history: ['Ancient war'], validated: true },
    timelinePlan: { timelineId: 't1', name: 'Main Timeline', events: [{ date: 'Year 1', title: 'Call to Adventure', description: 'Hero receives call', type: 'inciting' }, { date: 'Year 2', title: 'Final Battle', description: 'Climactic confrontation', type: 'climax' }], branches: [], validated: true },
    narrativePlan: { narrativeId: 'n1', title: 'The Last Kingdom', synopsis: 'A story of redemption', chapters: [{ number: 1, title: 'The Beginning', summary: 'Hero starts journey', scenes: ['forest', 'village'] }], wordCount: 50000, status: 'planned', validated: true },
    compositionPlan: { storyId: 's1', plotStructure: 'Three-Act', arcs: [{ name: 'Rise', description: 'Hero rises', beats: ['inciting', 'rising action'] }], themes: ['redemption'], conflicts: [{ type: 'man vs self', description: 'Inner conflict', parties: ['Kael'] }], foreshadowing: [], objectives: [{ characterId: 'c1', goal: 'defeat dark lord' }], validated: true },
    promptPackage: { storyPlan: '...', characterProfiles: '...', worldBible: '...', timelineReference: '...', compositionGuide: '...', styleGuide: '...', assembledPrompt: '...' },
    durationMs: 500,
    stageCount: 6,
  });
}

function makeMockAIResponse(content: string): AIResponse {
  return {
    id: 'resp-1',
    model: 'gpt-4',
    provider: 'openai',
    messages: [{ role: 'assistant', content }],
    tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
    finishReason: 'stop',
    latencyMs: 100,
  };
}

describe('NarrativeExecutionEngine', () => {
  it('executes a full planning result and returns ExecutionResult', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockImplementation(async (req: AIRequest) => {
        const lastMsg = req.messages[req.messages.length - 1];
        const c = lastMsg?.content ?? '';
        if (/character prose/i.test(c)) return makeMockAIResponse('Kael is a brave warrior with a troubled past. He stands tall with a scar across his cheek, his eyes reflecting the weight of his failures.');
        if (/world prose/i.test(c)) return makeMockAIResponse('Eldoria is a vast realm of ancient forests and misty mountains. The Northern Plains stretch for hundreds of miles, dotted with small farming villages.');
        if (/timeline narrative/i.test(c)) return makeMockAIResponse('The story begins in Year 1 when Kael receives the call to adventure. By Year 2, the final battle approaches as dark forces gather.');
        if (/canon entries/i.test(c)) return makeMockAIResponse('Canon entries established: Kael is the protagonist. Eldoria is the primary setting. Magic is elemental. The final battle occurs in Year 2.');
        if (/narrative chapters/i.test(c)) return makeMockAIResponse('# Chapter 1: The Beginning\n\nThe forest was dark and foreboding as Kael stepped onto the ancient path. The village behind him had been his home for years, but the call to adventure could no longer be ignored.\n\nHe walked through the trees, each step taking him closer to his destiny.');
        if (/composition prose/i.test(c)) return makeMockAIResponse('The Rise arc begins with the inciting incident in the forest. Kael encounters his first challenge, testing his resolve and setting the stage for his redemption.');
        if (/validate all/i.test(c)) return makeMockAIResponse('All consistency checks passed. Timeline is coherent. Canon is maintained. Character arcs are consistent with established traits.');
        if (/merge the following/i.test(c)) return makeMockAIResponse('# The Last Kingdom\n\n## Chapter 1: The Beginning\n\nThe forest was dark and foreboding as Kael stepped onto the ancient path...\n\n[Complete merged story draft]');
        return makeMockAIResponse('Generated content');
      }),
    } as any;

    const engine = new NarrativeExecutionEngine(mockAIRuntime, {
      defaultModel: 'gpt-4',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4000,
      defaultTimeout: 30000,
      defaultMaxRetries: 1,
      defaultParallel: true,
    });

    const result = await engine.execute(makeMockResult(), {}, undefined);

    expect(result.sessionId).toBeDefined();
    expect(result.storyDraft.title).toBe('The Last Kingdom');
    expect(result.storyDraft.characters).toHaveLength(1);
    expect(result.storyDraft.characters[0]!.name).toBe('Kael');
    expect(result.storyDraft.worlds).toHaveLength(1);
    expect(result.storyDraft.worlds[0]!.name).toBe('Eldoria');
    expect(result.storyDraft.chapters).toHaveLength(1);
    expect(result.storyDraft.chapters[0]!.title).toBe('The Beginning');
    expect(result.executionReport.status).toBe('completed');
    expect(result.validationReport).toBeDefined();
    expect(result.statistics).toBeDefined();
    expect(result.statistics.totalTasks).toBe(8);
    expect(result.statistics.completedTasks).toBe(8);
  }, 30000);

  it('reports engine health', () => {
    const engine = new NarrativeExecutionEngine({} as any);
    const health = engine.getHealth();
    expect(health.status).toBe('healthy');
    expect(health.activeSessions).toBe(0);
    expect(health.totalExecutions).toBe(0);
    expect(health.failedExecutions).toBe(0);
  });

  it('handles AI failures gracefully', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockRejectedValue(new Error('API unavailable')),
    } as any;

    const engine = new NarrativeExecutionEngine(mockAIRuntime, { defaultMaxRetries: 1, defaultTimeout: 100 });

    const result = await engine.execute(makeMockResult());
    expect(result.executionReport.stages.every(s => s.status === 'failed')).toBe(true);
    expect(result.statistics.failedTasks).toBe(8);
  });

  it('supports sequential mode', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockImplementation(async (req: AIRequest) => {
        return makeMockAIResponse('Generated content for testing sequential mode.');
      }),
    } as any;

    const engine = new NarrativeExecutionEngine(mockAIRuntime, { defaultParallel: false, defaultMaxRetries: 1 });

    const result = await engine.execute(makeMockResult(), { parallel: false }, undefined);
    expect(result.executionReport.status).toBe('completed');
    expect(result.statistics.completedTasks).toBeGreaterThan(0);
  }, 30000);

  it('supports cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();

    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue(makeMockAIResponse('should not be called')),
    } as any;

    const engine = new NarrativeExecutionEngine(mockAIRuntime, { defaultMaxRetries: 1, defaultTimeout: 100000 });

    await expect(engine.execute(makeMockResult(), {}, controller.signal)).rejects.toThrow();
    expect(mockAIRuntime.generate).not.toHaveBeenCalled();
  });

  it('uses custom ExecutionOptions over defaults', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue(makeMockAIResponse('test')),
    } as any;

    const engine = new NarrativeExecutionEngine(mockAIRuntime, {
      defaultModel: 'gpt-3.5-turbo',
      defaultTemperature: 0.5,
    });

    await engine.execute(makeMockResult(), { model: 'gpt-4', temperature: 0.9 });

    const generateMock = mockAIRuntime.generate as ReturnType<typeof vi.fn>;
    const call = generateMock.mock.calls[0]![0];
    expect(call.model).toBe('gpt-4');
    expect(call.temperature).toBe(0.9);
  }, 30000);
});
