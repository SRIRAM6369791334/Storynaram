import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@storynaram/workflow': path.resolve(import.meta.dirname, './src'),
      '@storynaram/core': path.resolve(import.meta.dirname, '../core/src'),
      '@storynaram/validation': path.resolve(import.meta.dirname, '../validation/src'),
      '@storynaram/events': path.resolve(import.meta.dirname, '../events/src'),
      '@storynaram/logger': path.resolve(import.meta.dirname, '../logger/src'),
    },
  },
});
