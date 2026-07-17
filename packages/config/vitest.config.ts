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
      '@storynaram/config': path.resolve(import.meta.dirname, './src'),
      '@storynaram/common': path.resolve(import.meta.dirname, '../common/src'),
    },
  },
});