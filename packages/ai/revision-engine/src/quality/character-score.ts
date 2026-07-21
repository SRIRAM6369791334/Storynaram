export interface CharacterScoreParams {
  presentCharacters: string[];
  expectedCharacters: string[];
  dialogueProportions: number;
  characterMentions: Map<string, number>;
  characterTraits: Map<string, string[]>;
}

export class CharacterScore {
  calculate(params: CharacterScoreParams): number {
    const { presentCharacters, expectedCharacters, dialogueProportions, characterMentions, characterTraits } = params;

    let score = 100;

    const missingChars = expectedCharacters.filter(c => !presentCharacters.includes(c));
    const missingPenalty = missingChars.length * 10;
    score -= missingPenalty;

    if (expectedCharacters.length > 0) {
      const mentionSpread = expectedCharacters.map(c => characterMentions.get(c) ?? 0);
      const avgMentions = mentionSpread.reduce((a, b) => a + b, 0) / expectedCharacters.length;
      const unbalancedChars = mentionSpread.filter(m => m < avgMentions * 0.5).length;
      score -= unbalancedChars * 5;
    }

    if (dialogueProportions > 0.8) {
      score -= 10;
    } else if (dialogueProportions < 0.05 && presentCharacters.length > 1) {
      score -= 5;
    }

    const traitConsistency = this.checkTraitConsistency(characterTraits);
    score -= traitConsistency * 8;

    const growthPresent = presentCharacters.some(c => {
      const traits = characterTraits.get(c);
      return traits ? traits.some(t => t.includes('grow') || t.includes('change') || t.includes('evolve')) : false;
    });
    if (!growthPresent && presentCharacters.length > 0) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private checkTraitConsistency(traits: Map<string, string[]>): number {
    let inconsistencies = 0;
    for (const [, traitList] of traits) {
      const contradicting = this.findContradictions(traitList);
      inconsistencies += contradicting;
    }
    return inconsistencies;
  }

  private findContradictions(traits: string[]): number {
    const pairs: Array<[string, string]> = [
      ['brave', 'cowardly'],
      ['kind', 'cruel'],
      ['honest', 'deceitful'],
      ['wise', 'foolish'],
      ['strong', 'weak'],
    ];
    let count = 0;
    for (const [a, b] of pairs) {
      if (traits.includes(a) && traits.includes(b)) count++;
    }
    return count;
  }
}
