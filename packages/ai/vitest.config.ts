import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true, },
  resolve: {
    alias: {
      '@storynaram/ai': path.resolve(import.meta.dirname, './src'),
      '@storynaram/core': path.resolve(import.meta.dirname, '../core/src'),
      '@storynaram/config': path.resolve(import.meta.dirname, '../config/src'),
      '@storynaram/logger': path.resolve(import.meta.dirname, '../logger/src'),
    },
  },
});
