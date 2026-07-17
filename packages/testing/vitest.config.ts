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
      '@storynaram/testing': path.resolve(import.meta.dirname, './src'),
      '@storynaram/core': path.resolve(import.meta.dirname, '../core/src'),
      '@storynaram/common': path.resolve(import.meta.dirname, '../common/src'),
      '@storynaram/logger': path.resolve(import.meta.dirname, '../logger/src'),
      '@storynaram/config': path.resolve(import.meta.dirname, '../config/src'),
      '@storynaram/events': path.resolve(import.meta.dirname, '../events/src'),
      '@storynaram/telemetry': path.resolve(import.meta.dirname, '../telemetry/src'),
    },
  },
});
