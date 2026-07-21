export interface ReadabilityScoreParams {
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  complexWords: number;
  avgSentenceLength: number;
  paragraphCount: number;
}

export class ReadabilityScore {
  calculate(params: ReadabilityScoreParams): number {
    const { totalWords, totalSentences, totalSyllables, complexWords, avgSentenceLength, paragraphCount } = params;

    if (totalWords === 0 || totalSentences === 0) return 0;

    const fleschIndex = this.calculateFleschReadingEase(totalSyllables, totalWords, totalSentences);
    let score = fleschIndex;

    const complexWordRatio = totalWords > 0 ? complexWords / totalWords : 0;
    if (complexWordRatio > 0.3) score -= 10;

    if (avgSentenceLength > 30) score -= 10;
    else if (avgSentenceLength > 20) score -= 5;

    if (paragraphCount < totalSentences / 10) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateFleschReadingEase(syllables: number, words: number, sentences: number): number {
    if (words === 0 || sentences === 0) return 0;
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  }
}
