import { BasePlannerAgent, AgentResult } from './agent-base.js';
import { PlanningContext, CanonEntry } from '../planning-context.js';
import { PlanningSession } from '../planning-session.js';

export class CanonAgent extends BasePlannerAgent {
  public readonly name = 'CanonAgent';
  public readonly stage = 'canon-validation';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const canonEntries: CanonEntry[] = [];

    if (context.characterPlan) {
      canonEntries.push({
        factId: `canon-char-${Date.now()}`,
        category: 'character',
        statement: `${context.characterPlan.name} is the ${context.characterPlan.role}`,
        source: 'character-planning',
        conflicts: [],
      });
    }

    if (context.worldPlan) {
      canonEntries.push({
        factId: `canon-world-${Date.now()}`,
        category: 'world',
        statement: `The story is set in ${context.worldPlan.name}`,
        source: 'world-planning',
        conflicts: [],
      });
    }

    if (context.timelinePlan) {
      for (const event of context.timelinePlan.events) {
        canonEntries.push({
          factId: `canon-tl-${Date.now()}-${event.title}`,
          category: 'timeline',
          statement: event.description,
          source: 'timeline-planning',
          conflicts: [],
        });
      }
    }

    context.canon = canonEntries;

    const conflicts = this.detectConflicts(context);
    if (conflicts.length > 0) {
      context.validationErrors.push(...conflicts);
      return this.failure(conflicts);
    }

    return this.success();
  }

  private detectConflicts(context: PlanningContext): string[] {
    const conflicts: string[] = [];
    if (!context.characterPlan) conflicts.push('No character plan to validate');
    if (!context.worldPlan) conflicts.push('No world plan to validate');
    if (!context.timelinePlan) conflicts.push('No timeline plan to validate');
    return conflicts;
  }
}
