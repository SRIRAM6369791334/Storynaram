import { describe, it, expect } from 'vitest';

describe('Worker smoke test', () => {
  it('should pass basic math', () => {
    expect(1 + 1).toBe(2);
  });
});
