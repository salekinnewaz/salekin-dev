/**
 * Vitest global setup. Runs once before the suite.
 * - Wipes the test database file
 * - Runs `prisma db push` against test.db
 * - Re-seeds it from a dedicated seed file
 */
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PRISMA_DIR = path.join(ROOT, 'prisma');
// Prisma resolves `file:./test.db` relative to the schema file's directory
// (prisma/), so the actual test DB lives at prisma/test.db. The teardown
// must match that path or the file leaks into the repo between runs.
const TEST_DB = path.join(PRISMA_DIR, 'test.db');
const TEST_DB_URL = 'file:./test.db';

export async function setup(): Promise<void> {
  process.env.DATABASE_URL = TEST_DB_URL;
  process.env.NODE_ENV = 'test';

  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);

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
}

export async function teardown(): Promise<void> {
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
}