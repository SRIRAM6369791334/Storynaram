import { bench, describe } from 'vitest';
import { PlanningPipeline } from '../src/pipeline/planning-pipeline';
import { BasePlannerAgent, AgentResult } from '../src/agents/agent-base';
import { PlanningContext } from '../src/planning-context';
import { PlanningSession } from '../src/planning-session';
import type { StoryIdea } from '../src/planning-context';

class FastAgent extends BasePlannerAgent {
  name = 'Fast'; stage = 'idea-analysis';
  async execute(): Promise<AgentResult> {
    return { success: true, errors: [], warnings: [] };
  }
}

const sampleIdea: StoryIdea = {
  title: 'B', genre: ['f'], logline: 'L', premise: 'P', themes: [], tone: 't', targetAudience: 'a', wordCountGoal: 50000,
};

const agents = Array.from({ length: 4 }, (_, i) => {
  const a = new FastAgent();
  a.name = `Agent${i}`;
  a.stage = ['idea-analysis', 'character-planning', 'world-planning', 'timeline-planning'][i]!;
  return a;
});

describe('Parallel pipeline benchmarks', () => {
  bench('parallel execution', async () => {
    const pipeline = new PlanningPipeline(
      { mode: 'parallel', maxRetries: 0, enableCheckpoints: false },
      agents,
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('bench-p', ctx);
    await pipeline.run(ctx, session);
  });

  bench('sequential execution', async () => {
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 0, enableCheckpoints: false },
      agents,
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('bench-s', ctx);
    await pipeline.run(ctx, session);
  });
});
