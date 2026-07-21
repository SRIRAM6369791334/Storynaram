import { bench, describe } from 'vitest';
import { ValidationAgent } from '../src/agents/validation-agent';
import { PlanningContext } from '../src/planning-context';
import { PlanningSession } from '../src/planning-session';
import { IdeaAgent } from '../src/agents/idea-agent';
import { CharacterAgent } from '../src/agents/character-agent';
import { WorldAgent } from '../src/agents/world-agent';
import { TimelineAgent } from '../src/agents/timeline-agent';
import { CanonAgent } from '../src/agents/canon-agent';
import { NarrativeAgent } from '../src/agents/narrative-agent';
import { CompositionAgent } from '../src/agents/composition-agent';
import type { StoryIdea } from '../src/planning-context';

const idea: StoryIdea = {
  title: 'Bench', genre: ['f'], logline: 'L', premise: 'P', themes: ['t'], tone: 'e', targetAudience: 'ya', wordCountGoal: 50000,
};

describe('Validation benchmarks', () => {
  bench('validate and assemble prompt', async () => {
    const ctx = new PlanningContext(idea);
    const session = new PlanningSession('b', ctx);
    await new IdeaAgent().execute(ctx, session);
    await new CharacterAgent().execute(ctx, session);
    await new WorldAgent().execute(ctx, session);
    await new TimelineAgent().execute(ctx, session);
    await new CanonAgent().execute(ctx, session);
    await new NarrativeAgent().execute(ctx, session);
    await new CompositionAgent().execute(ctx, session);
    await new ValidationAgent().execute(ctx, session);
  });
});
