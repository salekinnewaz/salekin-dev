/**
 * Apply the Prisma schema to a Turso (libSQL) database.
 *
 * Why this script exists instead of `prisma db push`:
 *   `prisma db push` with `provider = "sqlite"` validates the URL starts
 *   with `file:` at config load, so it refuses to talk to a `libsql://`
 *   URL — even though the libSQL driver adapter is the actual runtime
 *   path in `lib/db.ts`. We get around it by:
 *
 *   1. Generating the SQL DDL from `prisma/schema.prisma` via
 *      `prisma migrate diff --from-empty --to-schema-datamodel ... --script`.
 *      This uses Prisma's own model parser so the DDL is always in sync
 *      with the schema file.
 *   2. Applying that DDL through `@libsql/client`, which has no
 *      provider validation and accepts a `libsql://` URL.
 *
 * The SQL is split on `;` and statements are executed one-by-one because
 * libSQL's `execute()` accepts a single statement. `CREATE TABLE IF NOT
 * EXISTS` is not in the DDL (it's fresh schema), so re-running on an
 * already-initialized DB will fail — that's intentional, this is a
 * push-from-empty operation.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:push:turso
 */
import { spawnSync } from 'node:child_process';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error(
    'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be set.\n' +
      'If you installed Turso via the Vercel Marketplace integration, run\n' +
      '  vercel env pull .env.production.pull --environment production\n' +
      'and source the file (set +a; . ./.env.production.pull).',
  );
  process.exit(1);
}

// 1. Generate DDL from the schema.
const diff = spawnSync(
  'pnpm',
  [
    'exec',
    'prisma',
    'migrate',
    'diff',
    '--from-empty',
    '--to-schema-datamodel',
    'prisma/schema.prisma',
    '--script',
  ],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
);
if (diff.status !== 0) {
  console.error('Failed to generate DDL from schema.');
  process.exit(1);
}

const ddl = diff.stdout.trim();
if (!ddl) {
  console.log('Schema is empty; nothing to push.');
  process.exit(0);
}

// 2. Split on `;` and execute each non-empty statement. Prisma's
// `--script` output ends each statement with `;` and is followed by
// a blank line. We strip comments and whitespace defensively.
const statements = ddl
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.replace(/^--.*$/gm, '').trim())
  .filter((s) => s.length > 0);

if (statements.length === 0) {
  console.log('No statements to execute.');
  process.exit(0);
}

// 3. Apply via libSQL.
const client = createClient({ url, authToken: token });

let applied = 0;
try {
  for (const stmt of statements) {
    const head = (stmt.split('\n')[0] ?? '').slice(0, 70);
    process.stdout.write(`  → ${head}...\n`);
    await client.execute(stmt);
    applied++;
  }
  console.log(`\n✓ Applied ${applied}/${statements.length} statement(s) to ${url}`);
} catch (err) {
  console.error(`\n✗ Failed on statement ${applied + 1}:`, err);
  process.exit(1);
} finally {
  client.close();
}
