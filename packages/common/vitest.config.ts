import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    },
  resolve: {
    alias: {
      '@storynaram/common': new URL('./src', import.meta.url).pathname,
    },
  },
});