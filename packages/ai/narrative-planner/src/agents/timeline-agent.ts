import { BasePlannerAgent, AgentResult } from './agent-base';
import { PlanningContext, TimelinePlan } from '../planning-context';
import { PlanningSession } from '../planning-session';

export class TimelineAgent extends BasePlannerAgent {
  public readonly name = 'TimelineAgent';
  public readonly stage = 'timeline-planning';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const events: TimelinePlan['events'] = [
      {
        date: 'Chapter 1',
        title: 'Story Begins',
        description: `The journey of ${context.characterPlan?.name ?? 'the protagonist'} begins`,
        type: 'inciting-incident',
      },
      {
        date: 'Midpoint',
        title: 'Rising Action',
        description: 'The central conflict escalates',
        type: 'rising-action',
      },
      {
        date: 'Climax',
        title: 'Final Confrontation',
        description: 'The climax of the story',
        type: 'climax',
      },
    ];

    if (context.characterPlan) {
      events.unshift({
        date: 'Backstory',
        title: 'Character Origin',
        description: `The origin of ${context.characterPlan.name}`,
        type: 'backstory',
      });
    }

    const timelinePlan: TimelinePlan = {
      timelineId: `timeline-${Date.now()}`,
      name: `${context.idea.title} Timeline`,
      events,
      branches: [],
      validated: false,
    };

    context.timelinePlan = timelinePlan;
    return this.success();
  }
}
