import { BasePlannerAgent, AgentResult } from './agent-base';
import { PlanningContext, CompositionPlan } from '../planning-context';
import { PlanningSession } from '../planning-session';

export class CompositionAgent extends BasePlannerAgent {
  public readonly name = 'CompositionAgent';
  public readonly stage = 'composition-planning';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const compositionPlan: CompositionPlan = {
      storyId: `story-${Date.now()}`,
      plotStructure: 'three-act',
      arcs: [
        {
          name: 'Main Plot',
          description: `The central narrative of ${context.idea.title}`,
          beats: ['Setup', 'Confrontation', 'Resolution'],
        },
        {
          name: 'Character Arc',
          description: `${context.characterPlan?.name ?? 'The protagonist'}'s journey`,
          beats: ['Status quo', 'Change', 'Growth'],
        },
      ],
      themes: [...context.idea.themes],
      conflicts: context.idea.themes.map(t => ({
        type: 'thematic',
        description: t,
        parties: [context.characterPlan?.name ?? 'protagonist', 'world'],
      })),
      foreshadowing: [],
      objectives: context.characterPlan
        ? [{ characterId: context.characterPlan.characterId, goal: context.characterPlan.goals[0] ?? 'Complete the journey' }]
        : [],
      validated: false,
    };

    context.compositionPlan = compositionPlan;
    return this.success();
  }
}
