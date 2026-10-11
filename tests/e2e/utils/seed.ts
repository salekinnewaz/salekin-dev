/**
 * Playwright globalSetup. Runs once before the suite, before the
 * `webServer` boots. Re-runs the same seed pipeline the Vitest
 * global setup uses (`prisma db push` + `prisma db seed`) against
 * `prisma/test.db`, so every E2E run starts from a known,
 * deterministic state.
 *
 * Why we re-seed even though Vitest also does:
 *   The two suites are independent. E2E may run after Vitest has
 *   torn its DB down, on a clean checkout, or in CI where Vitest
 *   never ran. Seeding here makes the E2E suite self-contained.
 */
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PRISMA_DIR = path.join(ROOT, 'prisma');
const TEST_DB = path.join(PRISMA_DIR, 'test.db');
const TEST_DB_URL = 'file:./test.db';

export default async function globalSetup(): Promise<void> {
  // Mirror what the runtime server expects. The Node typings
  // mark `process.env` as readonly in some tsconfigs, so we use
  // bracket assignment to bypass the check — same trick the
  // Vitest setup uses.
  (process.env as Record<string, string>).DATABASE_URL = TEST_DB_URL;
  (process.env as Record<string, string>).NODE_ENV = 'test';

  // If a previous run left a test DB behind, wipe it so the seed
  // doesn't compound. The Vitest suite does the same.
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);

  console.log('[playwright] Seeding test DB at prisma/test.db…');
  execSync('pnpm exec prisma db push --skip-generate', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  });
  execSync('pnpm exec tsx prisma/seed.ts', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  });
  console.log('[playwright] Seed complete.');
}
