import { BasePlannerAgent, AgentResult } from './agent-base.js';
import { PlanningContext, PromptPackage } from '../planning-context.js';
import { PlanningSession } from '../planning-session.js';

export class ValidationAgent extends BasePlannerAgent {
  public readonly name = 'ValidationAgent';
  public readonly stage = 'consistency-validation';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!context.characterPlan) errors.push('Missing character plan');
    if (!context.worldPlan) errors.push('Missing world plan');
    if (!context.timelinePlan) errors.push('Missing timeline plan');
    if (!context.narrativePlan) errors.push('Missing narrative plan');
    if (!context.compositionPlan) errors.push('Missing composition plan');

    if (context.characterPlan && context.compositionPlan) {
      const charName = context.characterPlan.name;
      const compHasChar = context.compositionPlan.objectives.some(o => o.characterId === context.characterPlan!.characterId);
      if (!compHasChar) {
        warnings.push(`Character "${charName}" has no objectives in composition plan`);
      }
    }

    if (context.narrativePlan && context.characterPlan) {
      if (!context.narrativePlan.synopsis.includes(context.characterPlan.name)) {
        warnings.push(`Narrative synopsis does not mention "${context.characterPlan.name}"`);
      }
    }

    if (context.timelinePlan && context.narrativePlan) {
      if (context.timelinePlan.events.length < 3) {
        warnings.push('Timeline has fewer than 3 events, narrative may lack structure');
      }
    }

    if (errors.length > 0) {
      context.validationErrors.push(...errors);
      return this.failure(errors, warnings);
    }

    const promptPackage = this.assemblePrompt(context);

    context.promptPackage = promptPackage;
    context.validationErrors = [];

    return warnings.length > 0 ? this.partial(warnings) : this.success();
  }

  private assemblePrompt(context: PlanningContext): PromptPackage {
    const storyPlan = `Title: ${context.idea.title}\nGenre: ${context.idea.genre.join(', ')}\nLogline: ${context.idea.logline}\nThemes: ${context.idea.themes.join(', ')}`;
    const characterProfiles = context.characterPlan
      ? `Name: ${context.characterPlan.name}\nRole: ${context.characterPlan.role}\nTraits: ${context.characterPlan.traits.join(', ')}\nGoals: ${context.characterPlan.goals.join(', ')}`
      : '';
    const worldBible = context.worldPlan
      ? `World: ${context.worldPlan.name}\nRegions: ${context.worldPlan.regions.join(', ')}\nMagic: ${context.worldPlan.magicSystem}\nTech: ${context.worldPlan.technologyLevel}`
      : '';
    const timelineReference = context.timelinePlan
      ? context.timelinePlan.events.map(e => `- ${e.date}: ${e.title}`).join('\n')
      : '';
    const compositionGuide = context.compositionPlan
      ? `Structure: ${context.compositionPlan.plotStructure}\nArcs: ${context.compositionPlan.arcs.map(a => a.name).join(', ')}\nThemes: ${context.compositionPlan.themes.join(', ')}`
      : '';
    const styleGuide = `Tone: ${context.idea.tone}\nAudience: ${context.idea.targetAudience}\nWord Count Goal: ${context.idea.wordCountGoal}`;

    return {
      storyPlan,
      characterProfiles,
      worldBible,
      timelineReference,
      compositionGuide,
      styleGuide,
      assembledPrompt: [
        `# ${context.idea.title}\n`,
        `## Story Plan\n${storyPlan}\n`,
        `## Characters\n${characterProfiles}\n`,
        `## World\n${worldBible}\n`,
        `## Timeline\n${timelineReference}\n`,
        `## Composition\n${compositionGuide}\n`,
        `## Style\n${styleGuide}\n`,
      ].join('\n'),
    };
  }
}
