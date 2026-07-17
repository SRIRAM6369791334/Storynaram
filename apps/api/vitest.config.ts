import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true, include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@storynaram/common': path.resolve(import.meta.dirname, '../../packages/common/src'),
      '@storynaram/config': path.resolve(import.meta.dirname, '../../packages/config/src'),
      '@storynaram/logger': path.resolve(import.meta.dirname, '../../packages/logger/src'),
      '@storynaram/events': path.resolve(import.meta.dirname, '../../packages/events/src'),
      '@storynaram/telemetry': path.resolve(import.meta.dirname, '../../packages/telemetry/src'),
      '@storynaram/core': path.resolve(import.meta.dirname, '../../packages/core/src'),
    },
  },
});
