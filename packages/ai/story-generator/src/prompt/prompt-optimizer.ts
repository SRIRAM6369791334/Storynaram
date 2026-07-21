export interface OptimizedPrompt {
  systemPrompt: string;
  userPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  compressionRatio: number;
}

export class PromptOptimizer {
  optimize(prompt: { systemPrompt: string; userPrompt: string; estimatedTokens: number }, targetTokens: number): OptimizedPrompt {
    const totalTokens = prompt.estimatedTokens;
    if (totalTokens <= targetTokens) {
      return {
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
        originalTokens: totalTokens,
        optimizedTokens: totalTokens,
        compressionRatio: 1,
      };
    }

    const systemTokens = this.estimateTokens(prompt.systemPrompt);
    const userTokens = this.estimateTokens(prompt.userPrompt);

    const systemReduced = this.compress(prompt.systemPrompt, Math.max(200, Math.floor(targetTokens * 0.2)));
    const remainingTokens = targetTokens - this.estimateTokens(systemReduced);
    const userReduced = this.compress(prompt.userPrompt, Math.max(200, remainingTokens));

    return {
      systemPrompt: systemReduced,
      userPrompt: userReduced,
      originalTokens: totalTokens,
      optimizedTokens: this.estimateTokens(systemReduced) + this.estimateTokens(userReduced),
      compressionRatio: (this.estimateTokens(systemReduced) + this.estimateTokens(userReduced)) / totalTokens,
    };
  }

  private compress(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) return text;

    const lines = text.split('\n');
    const result: string[] = [];
    let currentChars = 0;

    const importantPrefixes = ['STORY:', 'CHAPTER', 'CHARACTER', 'SETTING', 'TIMELINE', 'WRITING GUIDELINES', 'You are', 'Write'];

    for (const line of lines) {
      const isImportant = importantPrefixes.some(p => line.startsWith(p));
      const isShort = line.length < 80;
      if (isImportant || isShort) {
        if (currentChars + line.length <= maxChars) {
          result.push(line);
          currentChars += line.length;
        } else {
          break;
        }
      } else if (currentChars + line.length <= maxChars) {
        result.push(line);
        currentChars += line.length;
      }
    }

    if (result.length === 0) {
      return text.slice(0, maxChars);
    }

    return result.join('\n');
  }

  compressText(text: string, maxTokens: number): string {
    return this.compress(text, maxTokens);
  }

  removeComments(prompt: string): string {
    return prompt.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }

  removeExtraWhitespace(prompt: string): string {
    return prompt.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
