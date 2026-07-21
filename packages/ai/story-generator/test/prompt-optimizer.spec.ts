import { describe, it, expect } from 'vitest';
import { PromptOptimizer } from '../src/prompt/prompt-optimizer';

describe('PromptOptimizer', () => {
  it('returns original prompt when under target token limit', () => {
    const optimizer = new PromptOptimizer();
    const result = optimizer.optimize(
      { systemPrompt: 'Short system prompt', userPrompt: 'Short user prompt', estimatedTokens: 10 },
      100,
    );

    expect(result.originalTokens).toBe(10);
    expect(result.optimizedTokens).toBe(10);
    expect(result.compressionRatio).toBe(1);
  });

  it('compresses prompt when over target', () => {
    const optimizer = new PromptOptimizer();
    const longPrompt = 'A'.repeat(5000);
    const longSystem = 'B'.repeat(2000);

    const result = optimizer.optimize(
      { systemPrompt: longSystem, userPrompt: longPrompt, estimatedTokens: 1750 },
      500,
    );

    expect(result.originalTokens).toBe(1750);
    expect(result.optimizedTokens).toBeLessThan(1750);
    expect(result.compressionRatio).toBeLessThan(1);
  });

  it('removes comments from prompt', () => {
    const optimizer = new PromptOptimizer();
    const withComments = 'Hello // inline comment\nworld /* block */ end';

    const cleaned = optimizer.removeComments(withComments);
    expect(cleaned).not.toContain('// inline comment');
    expect(cleaned).not.toContain('/* block */');
    expect(cleaned).toContain('Hello');
    expect(cleaned).toContain('world');
  });

  it('removes extra whitespace', () => {
    const optimizer = new PromptOptimizer();
    const messy = 'Too    many    spaces\n\n\n\nToo many newlines';

    const cleaned = optimizer.removeExtraWhitespace(messy);
    expect(cleaned).not.toContain('    ');
    expect(cleaned).not.toContain('\n\n\n\n');
  });

  it('compresses text to target token count', () => {
    const optimizer = new PromptOptimizer();
    const text = Array.from({ length: 50 }, (_, i) => `Line ${i}: This is some sample text that will be selectively compressed.`).join('\n');

    const compressed = optimizer.compressText(text, 10);
    expect(compressed.length).toBeLessThan(text.length);
  });
});
