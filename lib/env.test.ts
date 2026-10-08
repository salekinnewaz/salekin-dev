// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * `lib/env.ts` evaluates `process.env` at module import time, so each test
 * has to set up env BEFORE the import. We use `vi.resetModules()` to make
 * Node re-evaluate the module on the next `import()`.
 */

type EnvMap = Record<string, string | undefined>;

// `process.env.NODE_ENV` is typed as readonly by @types/node. Cast to a
// mutable Record for the duration of the test, then restore from snapshot.
const env = process.env as unknown as Record<string, string | undefined>;

function withEnv(values: EnvMap, fn: () => void | Promise<void>) {
  const snapshot: EnvMap = {};
  for (const key of Object.keys(values)) {
    snapshot[key] = env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete env[key];
    else env[key] = value;
  }
  vi.resetModules();
  return Promise.resolve(fn()).finally(() => {
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
    vi.resetModules();
  });
}

describe('env schema', () => {
  beforeEach(() => {
    // Default: development with local SQLite.
    env.DATABASE_URL = 'file:./dev.db';
    env.NODE_ENV = 'development';
    delete env.TURSO_DATABASE_URL;
    delete env.TURSO_AUTH_TOKEN;
  });
  afterEach(() => {
    vi.resetModules();
  });

  it('loads in development with just DATABASE_URL', async () => {
    await withEnv({ NODE_ENV: 'development', DATABASE_URL: 'file:./dev.db' }, async () => {
      const { env } = await import('./env');
      expect(env.NODE_ENV).toBe('development');
      expect(env.DATABASE_URL).toBe('file:./dev.db');
      expect(env.TURSO_DATABASE_URL).toBeUndefined();
    });
  });

  it('rejects an empty DATABASE_URL', async () => {
    await withEnv({ DATABASE_URL: '' }, async () => {
      await expect(import('./env')).rejects.toThrow(/Invalid environment/);
    });
  });

  it('accepts optional TURSO_* in non-production', async () => {
    await withEnv(
      {
        NODE_ENV: 'development',
        DATABASE_URL: 'file:./dev.db',
        TURSO_DATABASE_URL: 'https://db.turso.io',
        TURSO_AUTH_TOKEN: 'tok',
      },
      async () => {
        const { env } = await import('./env');
        expect(env.TURSO_DATABASE_URL).toBe('https://db.turso.io');
      },
    );
  });

  it('production requires BOTH TURSO_* together', async () => {
    await withEnv(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./dev.db',
        TURSO_DATABASE_URL: 'https://db.turso.io',
      },
      // No TURSO_AUTH_TOKEN
      async () => {
        await expect(import('./env')).rejects.toThrow(
          /TURSO_DATABASE_URL and TURSO_AUTH_TOKEN/,
        );
      },
    );
  });

  it('production rejects when only TURSO_AUTH_TOKEN is set', async () => {
    await withEnv(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./dev.db',
        TURSO_AUTH_TOKEN: 'tok',
      },
      async () => {
        await expect(import('./env')).rejects.toThrow(
          /TURSO_DATABASE_URL and TURSO_AUTH_TOKEN/,
        );
      },
    );
  });

  it('production accepts both TURSO_* set together', async () => {
    await withEnv(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./dev.db',
        TURSO_DATABASE_URL: 'https://db.turso.io',
        TURSO_AUTH_TOKEN: 'tok',
      },
      async () => {
        const { env } = await import('./env');
        expect(env.TURSO_DATABASE_URL).toBe('https://db.turso.io');
        expect(env.TURSO_AUTH_TOKEN).toBe('tok');
      },
    );
  });

  it('rejects a malformed TURSO_DATABASE_URL', async () => {
    await withEnv(
      {
        NODE_ENV: 'development',
        DATABASE_URL: 'file:./dev.db',
        TURSO_DATABASE_URL: 'not-a-url',
      },
      async () => {
        await expect(import('./env')).rejects.toThrow(/TURSO_DATABASE_URL/);
      },
    );
  });
});
