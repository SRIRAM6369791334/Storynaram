import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@storynaram/core': new URL('../core/src', import.meta.url).pathname,
      '@storynaram/schemas': new URL('../schemas/src', import.meta.url).pathname,
    },
  },
});
