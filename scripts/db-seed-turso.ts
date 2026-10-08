/**
 * Seed a Turso (libSQL) database.
 *
 * The seed is idempotent (upserts by slug / key / composite keys), so
 * re-running it after schema changes is safe.
 *
 * Like `db-push-turso.ts`, this wrapper rewrites `TURSO_*` env vars into
 * the `DATABASE_URL` + `DATABASE_AUTH_TOKEN` shape `prisma db seed` expects.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:seed:turso
 */
import { spawnSync } from 'node:child_process';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error(
    'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be set.',
  );
  process.exit(1);
}

const env: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL: url,
  DATABASE_AUTH_TOKEN: token,
  CHECKPOINT_DISABLE: '1',
};

const result = spawnSync('pnpm', ['exec', 'prisma', 'db', 'seed'], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
