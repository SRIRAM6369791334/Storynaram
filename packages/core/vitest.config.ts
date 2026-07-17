import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true, },
  resolve: {
    alias: {
      '@storynaram/common': new URL('../common/src', import.meta.url).pathname,
      '@storynaram/config': new URL('../config/src', import.meta.url).pathname,
      '@storynaram/logger': new URL('../logger/src', import.meta.url).pathname,
      '@storynaram/events': new URL('../events/src', import.meta.url).pathname,
      '@storynaram/telemetry': new URL('../telemetry/src', import.meta.url).pathname,
    },
  },
});
