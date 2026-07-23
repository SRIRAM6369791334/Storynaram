import { BasePlannerAgent, AgentResult } from './agent-base.js';
import { PlanningContext, WorldPlan } from '../planning-context.js';
import { PlanningSession } from '../planning-session.js';

export class WorldAgent extends BasePlannerAgent {
  public readonly name = 'WorldAgent';
  public readonly stage = 'world-planning';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const worldPlan: WorldPlan = {
      worldId: `world-${Date.now()}`,
      name: context.idea.title,
      regions: [`Primary region of ${context.idea.title}`],
      factions: [],
      magicSystem: context.idea.genre.includes('fantasy') ? 'elemental' : 'none',
      technologyLevel: context.idea.genre.includes('sci-fi') ? 'advanced' : 'medieval',
      cultures: [],
      history: [],
      validated: false,
    };

    context.worldPlan = worldPlan;
    return this.success();
  }
}
