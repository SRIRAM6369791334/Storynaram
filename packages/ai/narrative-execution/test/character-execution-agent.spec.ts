import { describe, it, expect, vi } from 'vitest';
import { CharacterExecutionAgent } from '../src/agents/character-execution-agent';
import type { ExecutionContext } from '../src/execution-context';
import { ExecutionMemory } from '../src/execution-memory';
import { PlanningResult } from '@storynaram/narrative-planner';

function makeMockResult(): PlanningResult {
  return new PlanningResult({
    sessionId: 'plan-1',
    storyPlan: { title: 'Test', genre: ['fantasy'], logline: '', premise: '', themes: [], characterCount: 1, worldCount: 1, timelineEvents: 0, narrativeChapters: 1, compositionArcs: 0 },
    characterPlan: { characterId: 'c1', name: 'Aria', role: 'protagonist', arc: 'redemption', traits: ['brave', 'wise'], goals: ['save the kingdom'], conflicts: ['inner doubt'], relationships: [{ targetId: 'c2', type: 'ally', description: 'trusted friend' }], validated: true },
    worldPlan: { worldId: 'w1', name: 'World', regions: [], factions: [], magicSystem: '', technologyLevel: '', cultures: [], history: [], validated: true },
    timelinePlan: { timelineId: 't1', name: 'Timeline', events: [], branches: [], validated: true },
    narrativePlan: { narrativeId: 'n1', title: 'Story', synopsis: '', chapters: [], wordCount: 0, status: '', validated: true },
    compositionPlan: { storyId: 's1', plotStructure: '', arcs: [], themes: [], conflicts: [], foreshadowing: [], objectives: [], validated: true },
    promptPackage: { storyPlan: '', characterProfiles: '', worldBible: '', timelineReference: '', compositionGuide: '', styleGuide: '', assembledPrompt: '' },
    durationMs: 100,
    stageCount: 6,
  });
}

describe('CharacterExecutionAgent', () => {
  it('has correct identity and dependencies', () => {
    const agent = new CharacterExecutionAgent();
    expect(agent.id).toBe('character-execution');
    expect(agent.name).toBe('Character Execution Agent');
    expect(agent.dependencies).toEqual([]);
  });

  it('executes and returns an AgentOutput', async () => {
    const agent = new CharacterExecutionAgent();
    const mockGenerate = vi.fn().mockResolvedValue({
      id: 'resp-1',
      model: 'gpt-4',
      provider: 'openai',
      messages: [{ role: 'assistant', content: 'Aria is a brave warrior...' }],
      tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
      finishReason: 'stop',
      latencyMs: 200,
    });

    const context: ExecutionContext = {
      sessionId: 'test-session',
      planningResult: makeMockResult(),
      aiRuntime: { generate: mockGenerate } as any,
      options: { model: 'gpt-4', temperature: 0.7, maxTokens: 2000 },
    };

    const output = await agent.execute({ context, memory: new ExecutionMemory() });

    expect(output.agentId).toBe('character-execution');
    expect(output.success).toBe(true);
    expect(output.content).toBe('Aria is a brave warrior...');
    expect(output.tokenUsage.totalTokens).toBe(150);
    expect(output.latencyMs).toBeGreaterThanOrEqual(0);
    expect(mockGenerate).toHaveBeenCalledTimes(1);

    const call = mockGenerate.mock.calls[0]![0];
    expect(call.model).toBe('gpt-4');
    expect(call.messages[0]!.role).toBe('system');
    expect(call.messages[1]!.role).toBe('user');
    expect(call.messages[1]!.content).toContain('Aria');
  });

  it('handles AI runtime failure gracefully', async () => {
    const agent = new CharacterExecutionAgent();
    const mockGenerate = vi.fn().mockRejectedValue(new Error('API error'));

    const context: ExecutionContext = {
      sessionId: 'test-session',
      planningResult: makeMockResult(),
      aiRuntime: { generate: mockGenerate } as any,
      options: { model: 'gpt-4' },
    };

    await expect(agent.execute({ context, memory: new ExecutionMemory() })).rejects.toThrow('API error');
  });
});
