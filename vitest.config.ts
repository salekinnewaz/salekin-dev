import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    globals: true,
    globalSetup: ['./tests/setup.ts'],
    setupFiles: ['./tests/dom-setup.ts'],
    // All DB-touching tests share a single SQLite file (prisma/test.db) and
    // a global bucket map for in-memory rate limiting. Run test files
    // serially so concurrent test files don't race on the same rows.
    // Tests within a single file still run concurrently.
    fileParallelism: false,
    include: [
      'lib/**/*.test.ts',
      'lib/**/*.test.tsx',
      'app/**/*.test.ts',
      'app/**/*.test.tsx',
      'components/**/*.test.ts',
      'components/**/*.test.tsx',
      'tests/**/*.test.ts',
    ],
    // E2E specs live in tests/e2e/ and are picked up by Playwright
    // (see playwright.config.ts). Make sure Vitest never tries to
    // run them — they have a different runtime.
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'playwright-report/**',
      'test-results/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/env.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});