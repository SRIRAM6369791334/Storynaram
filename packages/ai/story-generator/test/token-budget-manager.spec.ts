import { describe, it, expect } from 'vitest';
import { TokenBudgetManager } from '../src/selection/token-budget-manager';

describe('TokenBudgetManager', () => {
  it('calculates budget for chapters', () => {
    const manager = new TokenBudgetManager({ maxModelTokens: 128000 });
    const budget = manager.calculateBudget(10);

    expect(budget.totalBudget).toBeGreaterThan(0);
    expect(budget.perChapter).toBeGreaterThan(0);
    expect(budget.reservedForSystem).toBe(2000);
  });

  it('adjusts budget for different model sizes', () => {
    const manager = new TokenBudgetManager();
    const budgetSmall = manager.calculateBudget(5, { modelMaxTokens: 32000 });
    const budgetLarge = manager.calculateBudget(5, { modelMaxTokens: 128000 });

    expect(budgetSmall.totalBudget).toBeLessThan(budgetLarge.totalBudget);
  });

  it('allocates tokens for a chapter', () => {
    const manager = new TokenBudgetManager();
    const budget = manager.calculateBudget(5);

    const allocation = manager.allocateForChapter(budget, 1000);
    expect(allocation.promptTokens).toBeGreaterThan(0);
    expect(allocation.maxOutputTokens).toBe(4000);
  });

  it('handles single chapter', () => {
    const manager = new TokenBudgetManager();
    const budget = manager.calculateBudget(1);

    expect(budget.perChapter).toBeGreaterThan(0);
  });

  it('supports model max tokens override', () => {
    const manager = new TokenBudgetManager();
    manager.setModelMaxTokens(64000);
    expect(manager.maxTokens).toBe(64000);
  });
});
