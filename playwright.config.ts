import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for salekin-dev.
 *
 * Why this exists:
 *   The Vitest suite (lib/**, components/**, app/** tests) covers
 *   unit + jsdom. It cannot exercise the live DOM, scroll, hash-
 *   navigation, theme toggling, the contact-form server action
 *   round-trip, or the just-shipped availability-badge fly-in.
 *   This config wires `@playwright/test` against a real Next.js
 *   production build running on a seeded test SQLite — the same
 *   `prisma/test.db` that the Vitest global setup provisions.
 *
 *   `globalSetup` (./tests/e2e/utils/seed.ts) re-runs
 *   `prisma db push --skip-generate` and `prisma db seed` before
 *   the browsers launch so every run starts from a known state.
 *
 *   The webServer is a `pnpm build` + `pnpm start` so we're
 *   testing what users see, not dev mode. `webServer` is reused
 *   across all projects.
 *
 * Browser matrix:
 *   - `chromium` — Desktop Chrome (1280×720). The default. Runs
 *     in CI.
 *   - `mobile`   — iPhone 14 (390×844, Safari engine). Opt in
 *     locally with `pnpm test:e2e --project=mobile` (skipped in
 *     CI to save runner time, but ready to enable).
 */
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts$/,
  // `utils/**` holds helper modules (nav, seed, allure) — never
  // executed as tests. The testMatch above already excludes them
  // because they don't end in `.spec.ts`, but the explicit ignore
  // is a safety net if someone adds a `.spec.ts` file inside utils.
  testIgnore: ['**/utils/**', '**/node_modules/**'],
  fullyParallel: isCI ? false : true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  // The conditional `as const` here is intentional: without it
  // TypeScript widens the inner `['allure-playwright', { ... }]`
  // to a `(string | object)[]` and `defineConfig` rejects it.
  // `as const` makes the tuple readonly, which is assignable to
  // the `ReporterDescription` union.
  reporter: isCI
    ? ([
        ['github'],
        ['html', { open: 'never' }],
        // Allure writes machine-readable JSON results to
        // ./allure-results on every run. The static HTML report
        // is generated on demand by `pnpm test:e2e:allure` (or
        // built + deployed by the CI workflow). We always emit
        // the JSON so a developer can build the report later
        // from an old run without re-running tests.
        [
          'allure-playwright',
          {
            outputFolder: './allure-results',
            detail: true,
            embedVideos: true,
          },
        ],
      ] as const)
    : ([
        ['list'],
        [
          'allure-playwright',
          {
            outputFolder: './allure-results',
            detail: true,
            embedVideos: true,
          },
        ],
      ] as const),

  // Global setup re-seeds the test SQLite. Runs once before the
  // entire suite. Specs that mutate data (e.g. contact form)
  // either re-seed themselves or accept the seed as the baseline.
  globalSetup: './tests/e2e/utils/seed.ts',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Generous timeouts — the home page is heavy (hero terminal
    // animation, orbit, lazy chunks) and CI runners are slow.
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
      // Exclude mobile-only specs (they have their own project).
      testIgnore: /.*\.mobile\.spec\.ts$/,
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
      // Only run mobile-only specs.
      testMatch: /.*\.mobile\.spec\.ts$/,
    },
  ],

  // Boot a real production server against the seeded test SQLite.
  // timeout 3 min — `next build` is ~30s on a warm machine, longer
  // in CI. The webServer is reused across all projects.
  //
  // We set NODE_ENV=test (not production) so the home page keeps
  // its dev-friendly fallbacks for missing env vars, BUT we also
  // pass ADMIN_PASSWORD + ADMIN_SESSION_SECRET so the /admin
  // route is actually gated — the auth test needs something to
  // authenticate against. Both values are stable test fixtures.
  webServer: {
    // Push + seed the test SQLite (idempotent — schema/data may
    // already exist from a previous step), then build the prod
    // bundle (locally only — in CI the workflow's Build step
    // already produced .next/) and start the server. The Build
    // step in the workflow runs first so the schema is in place
    // when next build renders pages that query the DB.
    command: 'pnpm db:push && pnpm db:seed && pnpm build && pnpm start',
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DATABASE_URL: 'file:./test.db',
      NODE_ENV: 'test',
      ADMIN_PASSWORD: 'test-admin-pass-1234',
      ADMIN_SESSION_SECRET: 'playwright-e2e-session-secret-32+chars',
    },
  },
});
