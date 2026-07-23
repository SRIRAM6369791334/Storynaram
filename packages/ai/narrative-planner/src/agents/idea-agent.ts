import { BasePlannerAgent, AgentResult } from './agent-base.js';
import { PlanningContext } from '../planning-context.js';
import { PlanningSession } from '../planning-session.js';

export interface IdeaAnalysis {
  suggestedCharacters: Array<{ name: string; role: string; archetype: string }>;
  suggestedWorlds: Array<{ name: string; scope: string }>;
  suggestedTimelineSpan: string;
  estimatedWordCount: number;
  conflicts: string[];
  requiredResearch: string[];
}

export class IdeaAgent extends BasePlannerAgent {
  public readonly name = 'IdeaAgent';
  public readonly stage = 'idea-analysis';

  async execute(context: PlanningContext, _session: PlanningSession): Promise<AgentResult> {
    const analysis = this.analyze(context.idea);

    context.metadata['ideaAnalysis'] = analysis;
    context.metadata['ideaWordCount'] = analysis.estimatedWordCount;

    return this.success();
  }

  private analyze(idea: PlanningContext['idea']): IdeaAnalysis {
    const estimatedWordCount = idea.wordCountGoal || 80000;
    const roleCount = Math.max(2, Math.ceil(estimatedWordCount / 20000));

    const suggestedCharacters = this.extractCharacterHints(idea);
    while (suggestedCharacters.length < roleCount) {
      suggestedCharacters.push({
        name: `Character ${suggestedCharacters.length + 1}`,
        role: 'supporting',
        archetype: 'custom',
      });
    }

    return {
      suggestedCharacters,
      suggestedWorlds: [{ name: idea.title, scope: idea.tone }],
      suggestedTimelineSpan: idea.wordCountGoal > 100000 ? 'multi-era' : 'single-era',
      estimatedWordCount,
      conflicts: [...idea.themes.map(t => `Conflict arising from ${t}`)],
      requiredResearch: [],
    };
  }

  private extractCharacterHints(idea: PlanningContext['idea']): IdeaAnalysis['suggestedCharacters'] {
    const hints: IdeaAnalysis['suggestedCharacters'] = [];
    const words = idea.logline.toLowerCase().split(/\s+/);
    const potentialNames = words.filter(w => /^[A-Z]/.test(w) || w === 'hero' || w === 'villain');

    const firstName = potentialNames[0];
    if (firstName) {
      hints.push({
        name: firstName,
        role: 'protagonist',
        archetype: 'hero',
      });
    }
    const secondName = potentialNames[1];
    if (secondName) {
      hints.push({
        name: secondName,
        role: 'antagonist',
        archetype: 'villain',
      });
    }

    return hints;
  }
}
