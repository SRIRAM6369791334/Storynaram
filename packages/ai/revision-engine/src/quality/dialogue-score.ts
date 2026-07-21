export interface DialogueScoreParams {
  totalDialogueLines: number;
  uniqueSpeakers: number;
  dialogueProportion: number;
  weakTags: string[];
  repetitiveTags: string[];
  dialogueLengthIssues: string[];
}

export class DialogueScore {
  calculate(params: DialogueScoreParams): number {
    const { totalDialogueLines, uniqueSpeakers, dialogueProportion, weakTags, repetitiveTags, dialogueLengthIssues } = params;

    let score = 100;

    if (totalDialogueLines === 0) {
      return 0;
    }

    if (uniqueSpeakers < 2) {
      score -= 20;
    }

    if (dialogueProportion < 0.1) {
      score -= 15;
    } else if (dialogueProportion > 0.9) {
      score -= 10;
    }

    const weakTagPenalty = weakTags.length * 5;
    score -= weakTagPenalty;

    const repetitivePenalty = repetitiveTags.length * 8;
    score -= repetitivePenalty;

    const lengthPenalty = dialogueLengthIssues.length * 10;
    score -= lengthPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
