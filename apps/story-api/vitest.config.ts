import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@storynaram/common': path.resolve(import.meta.dirname, '../../packages/common/src'),
      '@storynaram/config': path.resolve(import.meta.dirname, '../../packages/config/src'),
      '@storynaram/logger': path.resolve(import.meta.dirname, '../../packages/logger/src'),
      '@storynaram/events': path.resolve(import.meta.dirname, '../../packages/events/src'),
      '@storynaram/telemetry': path.resolve(import.meta.dirname, '../../packages/telemetry/src'),
      '@storynaram/core': path.resolve(import.meta.dirname, '../../packages/core/src'),
      '@storynaram/domain-kernel': path.resolve(import.meta.dirname, '../../packages/domain/kernel/src'),
      '@storynaram/narrative-domain': path.resolve(import.meta.dirname, '../../packages/domain/narrative/src'),
      '@storynaram/character-domain': path.resolve(import.meta.dirname, '../../packages/domain/character/src'),
      '@storynaram/world-domain': path.resolve(import.meta.dirname, '../../packages/domain/world/src'),
      '@storynaram/timeline-domain': path.resolve(import.meta.dirname, '../../packages/domain/timeline/src'),
      '@storynaram/canon-domain': path.resolve(import.meta.dirname, '../../packages/domain/canon/src'),
      '@storynaram/composition-domain': path.resolve(import.meta.dirname, '../../packages/domain/composition/src'),
      '@storynaram/narrative-planner': path.resolve(import.meta.dirname, '../../packages/ai/narrative-planner/src'),
      '@storynaram/narrative-execution': path.resolve(import.meta.dirname, '../../packages/ai/narrative-execution/src'),
      '@storynaram/story-generator': path.resolve(import.meta.dirname, '../../packages/ai/story-generator/src'),
      '@storynaram/revision-engine': path.resolve(import.meta.dirname, '../../packages/ai/revision-engine/src'),
      '@storynaram/publishing-engine': path.resolve(import.meta.dirname, '../../packages/ai/publishing-engine/src'),
    },
  },
});
