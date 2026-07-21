import { bench, describe } from 'vitest';
import { NarrativePlanner } from '../src/narrative-planner';
import type { StoryIdea } from '../src/planning-context';

const idea: StoryIdea = {
  title: 'Benchmark Story',
  genre: ['fantasy'],
  logline: 'A hero rises to defeat an ancient evil and restore peace to the kingdom.',
  premise: 'Magic awakens in those of noble blood',
  themes: ['courage', 'destiny'],
  tone: 'epic',
  targetAudience: 'young-adult',
  wordCountGoal: 90000,
};

describe('Planning benchmarks', () => {
  bench('full sequential planning', async () => {
    const planner = new NarrativePlanner({ maxRetries: 0, pipelineMode: 'sequential', enableCheckpoints: false });
    await planner.plan(idea);
  });

  bench('session creation', async () => {
    const planner = new NarrativePlanner();
    await planner.createSession(idea);
  });
});
