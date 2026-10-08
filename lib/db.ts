import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient as createLibsqlClient } from '@libsql/client';
import { env } from './env';

// Prisma 5's `LogLevel` is declared in @prisma/client but not exported.
// Mirror the shape here so the log array typechecks.
type LogLevel = 'info' | 'query' | 'warn' | 'error';

/**
 * Database client.
 *
 * Local dev / test: native PrismaClient against the file-backed SQLite at
 * `DATABASE_URL` (e.g. `file:./dev.db`). Zero infra, instant boot.
 *
 * Production: PrismaClient with the libSQL driver adapter wired to Turso.
 * Vercel's filesystem is ephemeral, so we can't use `file:./dev.db` there
 * — the DB would reset on every redeploy. Turso gives us a managed
 * libSQL-compatible SQLite at the edge.
 *
 * The env schema requires BOTH `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
 * in production (see `lib/env.ts`), so by the time we reach this branch
 * we know the values are present.
 *
 * HMR-safe singleton: stash the client on globalThis in non-production so
 * Next.js's hot reload doesn't open a new connection on every module re-eval.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPrisma(): PrismaClient {
  const log: LogLevel[] =
    env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'];

  // Production: libSQL adapter (Turso). Falls through to native SQLite
  // if Turso vars are missing — that lets `next build` succeed against
  // the placeholder DATABASE_URL=file:./dev.db Vercel injects for the
  // `prisma generate` step at build time.
  if (env.NODE_ENV === 'production' && env.TURSO_DATABASE_URL) {
    const libsql = createLibsqlClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    // Prisma 5.22's public `adapter` field has a narrow structural type
    // that doesn't match the libSQL adapter's runtime shape (which is
    // verified at boot by `prisma db push` per DEPLOY.md §3). The cast
    // is local to this single construction site.
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter: adapter as unknown as never,
      log,
    });
  }

  return new PrismaClient({ log });
}

export const db: PrismaClient = globalForPrisma.prisma ?? buildPrisma();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
