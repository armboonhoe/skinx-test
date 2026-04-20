import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    alias: {
      // The real `server-only` module throws on any import; this stub makes
      // modules that use it testable under vitest (which has no bundler plugin).
      'server-only': path.resolve(__dirname, 'tests/helpers/server-only-stub.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
