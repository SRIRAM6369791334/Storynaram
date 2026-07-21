export interface TokenBudget {
  totalBudget: number;
  reservedForSystem: number;
  perChapter: number;
  remaining: number;
}

export class TokenBudgetManager {
  private readonly maxModelTokens: number;
  private readonly safetyMargin: number;
  private readonly reservedForSystem: number;
  private readonly reservedForOutput: number;

  constructor(options?: { maxModelTokens?: number; safetyMargin?: number; reservedForSystem?: number; reservedForOutput?: number }) {
    this.maxModelTokens = options?.maxModelTokens ?? 128000;
    this.safetyMargin = options?.safetyMargin ?? 0.1;
    this.reservedForSystem = options?.reservedForSystem ?? 2000;
    this.reservedForOutput = options?.reservedForOutput ?? 4000;
  }

  calculateBudget(chapterCount: number, options?: { modelMaxTokens?: number; safetyMargin?: number }): TokenBudget {
    const modelMax = options?.modelMaxTokens ?? this.maxModelTokens;
    const safety = options?.safetyMargin ?? this.safetyMargin;

    const usableTokens = Math.floor(modelMax * (1 - safety));
    const availableForContent = usableTokens - this.reservedForSystem - this.reservedForOutput;
    const perChapter = chapterCount > 0 ? Math.floor(availableForContent / chapterCount) : availableForContent;

    return {
      totalBudget: usableTokens,
      reservedForSystem: this.reservedForSystem,
      perChapter,
      remaining: usableTokens,
    };
  }

  allocateForChapter(budget: TokenBudget, chapterContextTokens: number): { promptTokens: number; maxOutputTokens: number } {
    const remaining = budget.remaining;
    const maxPromptTokens = Math.min(budget.perChapter + chapterContextTokens, remaining - this.reservedForOutput);
    const maxOutputTokens = this.reservedForOutput;

    return {
      promptTokens: Math.max(200, maxPromptTokens - this.reservedForSystem),
      maxOutputTokens,
    };
  }

  get maxTokens(): number {
    return this.maxModelTokens;
  }

  setModelMaxTokens(max: number): void {
    (this as { maxModelTokens: number }).maxModelTokens = max;
  }
}
