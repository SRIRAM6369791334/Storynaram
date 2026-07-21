export interface NarrativeScoreParams {
  pacingIssues: string[];
  flowIssues: string[];
  transitionIssues: string[];
  sceneOrderIssues: string[];
  chapterOrderIssues: string[];
  chapterCount: number;
  avgChapterWordCount: number;
}

export class NarrativeScore {
  calculate(params: NarrativeScoreParams): number {
    const { pacingIssues, flowIssues, transitionIssues, sceneOrderIssues, chapterOrderIssues, chapterCount, avgChapterWordCount } = params;

    let score = 100;

    const pacingPenalty = pacingIssues.length * 12;
    score -= pacingPenalty;

    const flowPenalty = flowIssues.length * 10;
    score -= flowPenalty;

    const transitionPenalty = transitionIssues.length * 8;
    score -= transitionPenalty;

    const scenePenalty = sceneOrderIssues.length * 15;
    score -= scenePenalty;

    const chapterPenalty = chapterOrderIssues.length * 20;
    score -= chapterPenalty;

    if (chapterCount < 2) {
      score -= 10;
    }

    if (avgChapterWordCount < 200) {
      score -= 10;
    } else if (avgChapterWordCount > 5000) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
