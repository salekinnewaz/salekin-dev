/**
 * Seed a Turso (libSQL) database.
 *
 * The seed (`prisma/seed.ts`) imports its PrismaClient from `lib/db.ts`,
 * which branches on `NODE_ENV`:
 *   - production + TURSO_* set → libSQL adapter
 *   - else                    → file-backed SQLite
 *
 * To hit the production branch we need to run the seed under
 * `NODE_ENV=production` with the Turso env vars in scope. The Prisma CLI's
 * `db seed` subcommand (the official entry point) does not let us
 * override `NODE_ENV` or inject env cleanly, so we invoke the seed
 * directly via `tsx` with the right env.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:seed:turso
 */
import { spawnSync } from 'node:child_process';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be set.');
  process.exit(1);
}

const env: NodeJS.ProcessEnv = {
  ...process.env,
  // Force the production branch in `lib/db.ts`. Without this, dev defaults
  // would point the client at file:./dev.db and writes would land in the
  // local SQLite file instead of Turso.
  NODE_ENV: 'production',
  // DATABASE_URL is still required by `lib/env.ts` (it's a non-optional
  // field in the zod schema). Point it at libsql:// for consistency;
  // the libSQL adapter ignores it but the env validator doesn't.
  DATABASE_URL: url,
  TURSO_DATABASE_URL: url,
  TURSO_AUTH_TOKEN: token,
  CHECKPOINT_DISABLE: '1',
};

const result = spawnSync('pnpm', ['exec', 'tsx', 'prisma/seed.ts'], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
