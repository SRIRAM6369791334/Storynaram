export interface EmotionScoreParams {
  emotionalWords: number;
  totalWords: number;
  emotionalVariety: number;
  positiveRatio: number;
  negativeRatio: number;
  intenseEmotions: number;
}

export class EmotionScore {
  calculate(params: EmotionScoreParams): number {
    const { emotionalWords, totalWords, emotionalVariety, positiveRatio, negativeRatio, intenseEmotions } = params;

    if (totalWords === 0) return 0;

    let score = 50;

    const emotionRatio = totalWords > 0 ? emotionalWords / totalWords : 0;
    if (emotionRatio >= 0.05 && emotionRatio <= 0.2) {
      score += 20;
    } else if (emotionRatio > 0.2) {
      score += 10;
    } else {
      score -= 10;
    }

    if (emotionalVariety >= 5) score += 15;
    else if (emotionalVariety >= 3) score += 10;
    else score -= 10;

    if (positiveRatio > 0 && negativeRatio > 0) {
      score += 10;
    }

    if (intenseEmotions > 0 && intenseEmotions <= 3) {
      score += 5;
    } else if (intenseEmotions > 5) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
