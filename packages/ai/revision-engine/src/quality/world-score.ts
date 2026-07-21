export interface WorldScoreParams {
  worldNames: string[];
  locationCount: number;
  cultureMentions: number;
  magicMentions: number;
  technologyMentions: number;
  environmentMentions: number;
  consistencyIssues: string[];
}

export class WorldScore {
  calculate(params: WorldScoreParams): number {
    const { worldNames, locationCount, cultureMentions, magicMentions, technologyMentions, environmentMentions, consistencyIssues } = params;

    let score = 100;

    if (worldNames.length === 0) {
      score -= 20;
    }

    const elements = [
      { count: cultureMentions, name: 'culture' },
      { count: magicMentions, name: 'magic' },
      { count: technologyMentions, name: 'technology' },
      { count: environmentMentions, name: 'environment' },
    ];

    for (const element of elements) {
      if (element.count === 0 && worldNames.length > 0) {
        score -= 5;
      }
    }

    if (locationCount === 0) {
      score -= 10;
    } else if (locationCount < 3) {
      score -= 5;
    }

    const consistencyPenalty = consistencyIssues.length * 15;
    score -= consistencyPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
