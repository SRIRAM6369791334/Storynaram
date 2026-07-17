import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    },
    resolve: {
        alias: {
            '@storynaram/plugin-sdk': path.resolve(import.meta.dirname, './src'),
            '@storynaram/core': path.resolve(import.meta.dirname, '../core/src'),
            '@storynaram/events': path.resolve(import.meta.dirname, '../events/src'),
        },
    },
});
//# sourceMappingURL=vitest.config.js.map