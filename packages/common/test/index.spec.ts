import { describe, it, expect } from 'vitest';

describe('@storynaram/common', () => {
  it('should export expected modules', async () => {
    const mod = await import('../src/index');
    expect(mod).toBeDefined();
  });
});
