export interface ConsistencyScoreParams {
  characterInconsistencies: string[];
  worldInconsistencies: string[];
  timelineInconsistencies: string[];
  plotInconsistencies: string[];
  styleInconsistencies: string[];
}

export class ConsistencyScore {
  calculate(params: ConsistencyScoreParams): number {
    const { characterInconsistencies, worldInconsistencies, timelineInconsistencies, plotInconsistencies, styleInconsistencies } = params;

    let score = 100;

    const charPenalty = characterInconsistencies.length * 15;
    score -= charPenalty;

    const worldPenalty = worldInconsistencies.length * 12;
    score -= worldPenalty;

    const timelinePenalty = timelineInconsistencies.length * 18;
    score -= timelinePenalty;

    const plotPenalty = plotInconsistencies.length * 20;
    score -= plotPenalty;

    const stylePenalty = styleInconsistencies.length * 8;
    score -= stylePenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
