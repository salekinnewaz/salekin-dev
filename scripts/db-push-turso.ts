/**
 * Push the Prisma schema to a Turso (libSQL) database.
 *
 * The project's `prisma/schema.prisma` declares `url = env("DATABASE_URL")`,
 * which is correct for local dev (file:./dev.db) and for Vercel's build
 * step (which only needs `prisma generate`). But pushing the schema to
 * Turso requires `DATABASE_URL` to point at the `libsql://` URL.
 *
 * This wrapper:
 *   1. Validates that `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set.
 *   2. Rewrites them into `DATABASE_URL` (libsql://) and a `DATABASE_AUTH_TOKEN`
 *      Prisma understands.
 *   3. Invokes `prisma db push` with the schema unchanged.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:push:turso
 */
import { spawnSync } from 'node:child_process';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error(
    'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be set.\n' +
      'Get them from `turso db show <name>` and `turso db tokens create <name>`.',
  );
  process.exit(1);
}

const env: NodeJS.ProcessEnv = {
  ...process.env,
  // Prisma reads `url` from the schema; we point it at libsql for this run.
  DATABASE_URL: url,
  // libsql needs the token via DATABASE_AUTH_TOKEN when used through Prisma's
  // legacy SQLite driver. (We don't use that driver at runtime — `lib/db.ts`
  // uses the libSQL driver adapter — but `prisma db push` itself does use it
  // to introspect the live URL, so the token must be in the env.)
  DATABASE_AUTH_TOKEN: token,
  // Quiet down Prisma's analytics nag.
  CHECKPOINT_DISABLE: '1',
};

const result = spawnSync('pnpm', ['exec', 'prisma', 'db', 'push'], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
