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
      '@storynaram/runtime': new URL('../runtime/src', import.meta.url).pathname,
      '@storynaram/logger': new URL('../logger/src', import.meta.url).pathname,
    },
  },
});
