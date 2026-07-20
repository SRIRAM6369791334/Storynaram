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
      '@storynaram/validation': new URL('../validation/src', import.meta.url).pathname,
      '@storynaram/registry': new URL('../registry/src', import.meta.url).pathname,
      '@storynaram/events': new URL('../events/src', import.meta.url).pathname,
      '@storynaram/logger': new URL('../logger/src', import.meta.url).pathname,
    },
  },
});
