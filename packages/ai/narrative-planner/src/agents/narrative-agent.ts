import { BasePlannerAgent, AgentResult } from './agent-base.js';
import { PlanningContext, NarrativePlan } from '../planning-context.js';
import { PlanningSession } from '../planning-session.js';

export class NarrativeAgent extends BasePlannerAgent {
  public readonly name = 'NarrativeAgent';
  public readonly stage = 'narrative-planning';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const chapterCount = Math.max(3, Math.ceil((context.metadata['ideaWordCount'] as number ?? 80000) / 5000));

    const chapters: NarrativePlan['chapters'] = [];
    for (let i = 1; i <= chapterCount; i++) {
      chapters.push({
        number: i,
        title: i === 1 ? 'Introduction' : i === chapterCount ? 'Resolution' : `Chapter ${i}`,
        summary: i === 1
          ? `Introduce ${context.characterPlan?.name ?? 'the protagonist'} and the world`
          : i === chapterCount
            ? `Resolve the central conflict`
            : `Continue the journey`,
        scenes: [`Scene ${i}.1`, `Scene ${i}.2`],
      });
    }

    const narrativePlan: NarrativePlan = {
      narrativeId: `narrative-${Date.now()}`,
      title: context.idea.title,
      synopsis: context.idea.logline,
      chapters,
      wordCount: context.metadata['ideaWordCount'] as number ?? 80000,
      status: 'planned',
      validated: false,
    };

    context.narrativePlan = narrativePlan;
    return this.success();
  }
}
