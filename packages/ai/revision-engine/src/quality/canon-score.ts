export interface CanonScoreParams {
  factViolations: string[];
  referenceErrors: string[];
  eventContradictions: string[];
  historyInconsistencies: string[];
  relationshipErrors: string[];
}

export class CanonScore {
  calculate(params: CanonScoreParams): number {
    const { factViolations, referenceErrors, eventContradictions, historyInconsistencies, relationshipErrors } = params;

    let score = 100;

    const violationPenalty = factViolations.length * 20;
    score -= violationPenalty;

    const referencePenalty = referenceErrors.length * 15;
    score -= referencePenalty;

    const eventPenalty = eventContradictions.length * 25;
    score -= eventPenalty;

    const historyPenalty = historyInconsistencies.length * 15;
    score -= historyPenalty;

    const relationshipPenalty = relationshipErrors.length * 20;
    score -= relationshipPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
