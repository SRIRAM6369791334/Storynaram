import { DomainEvent } from '@storynaram/domain-kernel';
import { PlanningResult } from './planning-result';

export class NarrativePlanGeneratedEvent extends DomainEvent {
  constructor(aggregateId: string, payload: { planId: string; result: PlanningResult }) {
    super({
      aggregateId,
      aggregateType: 'NarrativePlanner',
      eventType: 'narrative.plan.generated',
      payload: { planId: payload.planId, result: payload.result.toJSON() },
    });
  }
}

export class PlanningStageCompletedEvent extends DomainEvent {
  constructor(aggregateId: string, payload: { sessionId: string; stage: string; durationMs: number }) {
    super({
      aggregateId,
      aggregateType: 'NarrativePlanner',
      eventType: 'narrative.planning.stage.completed',
      payload,
    });
  }
}

export class PlanningFailedEvent extends DomainEvent {
  constructor(aggregateId: string, payload: { sessionId: string; error: string; stage: string }) {
    super({
      aggregateId,
      aggregateType: 'NarrativePlanner',
      eventType: 'narrative.planning.failed',
      payload,
    });
  }
}

export function assemblePromptPackage(result: PlanningResult): string {
  return [
    `# ${result.storyPlan.title}`,
    ``,
    `## Story Plan`,
    `Genre: ${result.storyPlan.genre.join(', ')}`,
    `Logline: ${result.storyPlan.logline}`,
    `Themes: ${result.storyPlan.themes.join(', ')}`,
    `Characters: ${result.storyPlan.characterCount}`,
    `Chapters: ${result.storyPlan.narrativeChapters}`,
    `Arcs: ${result.storyPlan.compositionArcs}`,
    ``,
    `## Character Profile`,
    `Name: ${result.characterPlan.name}`,
    `Role: ${result.characterPlan.role}`,
    `Traits: ${result.characterPlan.traits.join(', ')}`,
    `Arc: ${result.characterPlan.arc}`,
    ``,
    `## World Settings`,
    `Name: ${result.worldPlan.name}`,
    `Magic: ${result.worldPlan.magicSystem}`,
    `Technology: ${result.worldPlan.technologyLevel}`,
    ``,
    `## Timeline`,
    ...result.timelinePlan.events.map(e => `- ${e.date}: ${e.title}`),
    ``,
    `## Composition Guide`,
    `Structure: ${result.compositionPlan.plotStructure}`,
    `Arcs: ${result.compositionPlan.arcs.map(a => a.name).join(', ')}`,
    ``,
    result.promptPackage.assembledPrompt,
  ].join('\n');
}
