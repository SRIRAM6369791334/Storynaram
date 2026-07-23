import { BasePlannerAgent, AgentResult } from './agent-base.js';
import { PlanningContext, CharacterPlan } from '../planning-context.js';
import { PlanningSession } from '../planning-session.js';

export class CharacterAgent extends BasePlannerAgent {
  public readonly name = 'CharacterAgent';
  public readonly stage = 'character-planning';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const analysis = context.metadata['ideaAnalysis'] as { suggestedCharacters: Array<{ name: string; role: string }> } | undefined;
    const suggested = analysis?.suggestedCharacters ?? [];

    const characterPlan: CharacterPlan = {
      characterId: `char-${Date.now()}`,
      name: suggested[0]?.name ?? 'Protagonist',
      role: (suggested[0]?.role ?? 'protagonist') as string,
      arc: 'transformation',
      traits: ['determined', 'resourceful'],
      goals: [`Resolve the central conflict of ${context.idea.title}`],
      conflicts: [context.idea.themes[0] ? `${context.idea.themes[0]} driven conflict` : 'Central conflict'],
      relationships: [],
      validated: false,
    };

    for (let i = 1; i < suggested.length; i++) {
      const s = suggested[i]!;
      characterPlan.relationships.push({
        targetId: `char-${i}`,
        type: s.role === 'antagonist' ? 'opposes' : 'supports',
        description: `${s.role} relationship`,
      });
    }

    context.characterPlan = characterPlan;
    return this.success();
  }
}
