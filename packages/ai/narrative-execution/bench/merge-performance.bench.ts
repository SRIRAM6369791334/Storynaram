import { bench, describe } from 'vitest';
import { ExecutionGraph } from '../src/execution-graph';
import { ExecutionMemory } from '../src/execution-memory';
import { NarrativeExecutionEngine } from '../src/narrative-execution-engine';
import type { CharacterProse, WorldProse, TimelineProse, NarrativeProse, CompositionProse, StoryDraft, ChapterDraft } from '../src/execution-result';
import type { AgentOutput } from '../src/agents/execution-agent';

describe('Merge Performance Benchmarks', () => {
  bench('build story draft from memory with 8 agents', () => {
    const memory = new ExecutionMemory();
    const agents = ['character-execution', 'world-execution', 'timeline-execution', 'canon-execution',
      'narrative-execution', 'composition-execution', 'validation-execution', 'merge-execution'];

    for (const agentId of agents) {
      const output: AgentOutput = {
        agentId,
        success: true,
        content: 'A'.repeat(5000),
        tokenUsage: { inputTokens: 100, outputTokens: 200, totalTokens: 300 },
        latencyMs: 100,
      };
      memory.record({ agentId, stage: agentId, output, timestamp: new Date(), durationMs: 100 });
    }

    const chars: CharacterProse[] = [{ name: 'Hero', role: 'protagonist', introduction: 'Intro', dialogue: 'Dialogue', scenes: ['scene1'] }];
    const worlds: WorldProse[] = [{ name: 'World', regions: ['North'], description: 'Desc' }];
    const timeline: TimelineProse = { events: [{ date: 'Year 1', title: 'Event', narrative: '' }], overallTimeline: 'Timeline' };
    const chapters: ChapterDraft[] = [{ number: 1, title: 'Ch1', content: 'Content', wordCount: 500 }];
    const narrative: NarrativeProse = { synopsis: 'Synopsis', chapters };
    const composition: CompositionProse = { arcs: [{ name: 'Arc1', content: 'Content' }], overallStructure: 'Structure' };
    const _draft: StoryDraft = {
      title: 'Story',
      chapters,
      characters: chars,
      worlds,
      timeline,
      narrative,
      composition,
      validationResults: [],
      metadata: { mergedContent: memory.getOutput('merge-execution')?.content ?? '' },
    };
  });
});
