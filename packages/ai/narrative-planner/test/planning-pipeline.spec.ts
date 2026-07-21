import { describe, it, expect } from 'vitest';
import { PlanningPipeline } from '../src/pipeline/planning-pipeline';
import { BasePlannerAgent, AgentResult } from '../src/agents/agent-base';
import { PlanningContext } from '../src/planning-context';
import { PlanningSession } from '../src/planning-session';
import type { StoryIdea } from '../src/planning-context';

const sampleIdea: StoryIdea = {
  title: 'Pipe Test', genre: ['f'], logline: 'L', premise: 'P', themes: [], tone: 't', targetAudience: 'a', wordCountGoal: 50000,
};

class SuccessAgent extends BasePlannerAgent {
  name = 'SuccessAgent'; stage = 'idea-analysis';
  async execute(): Promise<AgentResult> {
    return { success: true, errors: [], warnings: [] };
  }
}

class FailAgent extends BasePlannerAgent {
  name = 'FailAgent'; stage = 'character-planning';
  async execute(): Promise<AgentResult> {
    return { success: false, errors: ['Failed intentionally'], warnings: [] };
  }
}

describe('PlanningPipeline', () => {
  it('runs sequential pipeline successfully', async () => {
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 1, enableCheckpoints: false },
      [new SuccessAgent()],
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('pipe-1', ctx);
    const results = await pipeline.run(ctx, session);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.success)).toBe(true);
  });

  it('fails on agent error', async () => {
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 0, enableCheckpoints: false },
      [new SuccessAgent(), new FailAgent()],
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('pipe-2', ctx);
    const results = await pipeline.run(ctx, session);
    const failed = results.filter(r => !r.success);
    expect(failed.length).toBeGreaterThan(0);
    expect(failed[0]!.errors).toContain('Failed intentionally');
  });

  it('runs parallel pipeline', async () => {
    const pipeline = new PlanningPipeline(
      { mode: 'parallel', maxRetries: 1, enableCheckpoints: false },
      [new SuccessAgent(), new SuccessAgent()],
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('pipe-3', ctx);
    const results = await pipeline.run(ctx, session);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.success)).toBe(true);
  });

  it('supports abort signal', async () => {
    let executionCount = 0;
    class TrackAgent extends BasePlannerAgent {
      name = 'Track'; stage = 'world-planning';
      async execute(): Promise<AgentResult> {
        executionCount++;
        return { success: true, errors: [], warnings: [] };
      }
    }
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 0, enableCheckpoints: false },
      [new TrackAgent()],
    );
    pipeline.onAbort();
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('pipe-4', ctx);
    const results = await pipeline.run(ctx, session);
    expect(executionCount).toBe(0);
  });

  it('retries on failure', async () => {
    let attempts = 0;
    class RetryAgent extends BasePlannerAgent {
      name = 'RetryAgent'; stage = 'idea-analysis';
      async execute(): Promise<AgentResult> {
        attempts++;
        if (attempts < 2) return { success: false, errors: ['Not yet'], warnings: [] };
        return { success: true, errors: [], warnings: [] };
      }
    }
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 2, enableCheckpoints: false },
      [new RetryAgent()],
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('pipe-5', ctx);
    const results = await pipeline.run(ctx, session);
    expect(results[0]!.success).toBe(true);
    expect(results[0]!.retries).toBe(1);
  });

  it('creates checkpoints when enabled', async () => {
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 0, enableCheckpoints: true },
      [new SuccessAgent()],
    );
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('pipe-6', ctx);
    await pipeline.run(ctx, session);
    expect(session.checkpoints.length).toBeGreaterThan(0);
  });

  it('returns graph reference', () => {
    const pipeline = new PlanningPipeline(
      { mode: 'sequential', maxRetries: 0, enableCheckpoints: false },
      [new SuccessAgent()],
    );
    expect(pipeline.getGraph()).toBeDefined();
  });
});
