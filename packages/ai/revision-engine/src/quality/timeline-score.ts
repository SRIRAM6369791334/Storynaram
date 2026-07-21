export interface TimelineScoreParams {
  totalEvents: number;
  chronologicalOrder: boolean;
  flashbackCount: number;
  timeJumpCount: number;
  ageConsistencyIssues: string[];
  temporalContradictions: string[];
}

export class TimelineScore {
  calculate(params: TimelineScoreParams): number {
    const { totalEvents, chronologicalOrder, flashbackCount, timeJumpCount, ageConsistencyIssues, temporalContradictions } = params;

    let score = 100;

    if (totalEvents === 0) {
      score -= 20;
    }

    if (!chronologicalOrder && flashbackCount === 0 && timeJumpCount === 0) {
      score -= 15;
    }

    if (flashbackCount > 5) {
      score -= 10;
    }

    if (timeJumpCount > 3) {
      score -= 10;
    }

    const agePenalty = ageConsistencyIssues.length * 20;
    score -= agePenalty;

    const contradictionPenalty = temporalContradictions.length * 25;
    score -= contradictionPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
