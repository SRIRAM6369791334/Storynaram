import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  it('should resolve module imports', async () => {
    await expect(import('../src/app.module')).resolves.toBeDefined();
  });
});
