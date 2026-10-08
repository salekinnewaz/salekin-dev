import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SITE_URL: z.string().url().optional(),
  // Single-password gate for /admin. Empty/unset = no auth (dev mode).
  ADMIN_PASSWORD: z.string().optional(),
  // Required in production when ADMIN_PASSWORD is set. Used to sign the session
  // cookie. Length is enforced at runtime (see lib/security/admin-session.ts)
  // so the env module can load even with an unset secret.
  ADMIN_SESSION_SECRET: z.string().optional(),
  // Production-only: libSQL/Turso connection. Both are required together in
  // production; in dev we fall back to DATABASE_URL (file:./dev.db).
  // Format: libsql://<db>.<org>.turso.io
  TURSO_DATABASE_URL: z.string().url().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  const data = parsed.data;
  // Production: require BOTH Turso vars together. Half-configured is a
  // footgun: the client would try to reach libsql:// without a token and
  // surface a confusing 401 instead of a clear boot error.
  if (data.NODE_ENV === 'production') {
    const hasUrl = !!data.TURSO_DATABASE_URL;
    const hasToken = !!data.TURSO_AUTH_TOKEN;
    if (hasUrl !== hasToken) {
      throw new Error(
        'Invalid environment variables:\n' +
          '  - TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set together in production',
      );
    }
  }
  return data;
}

export const env = parseEnv();
