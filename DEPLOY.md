# Deploying salekin.dev

Single-author personal site. Vercel for hosting, Turso for the database (libSQL-compatible SQLite, free tier is plenty).

## Architecture

- **App**: Next.js 15 App Router, React 19, server components + server actions.
- **DB**: Prisma + SQLite schema. Locally: `file:./dev.db`. In production: Turso (libSQL) reached via `@prisma/adapter-libsql`.
- **Files**: A few static assets (`/resume.pdf`, the og-image route, the CV download tracker). No S3 / R2 needed.
- **Email**: `Contact` form just persists to the DB; no outbound mail is sent.
- **Cron / background work**: none.

## One-time setup

### 1. Turso

1. Install the CLI: `brew install tursodatabase/tap/turso` (or `npm i -g @tursodatabase/cli`).
2. `turso auth login`.
3. Create a DB: `turso db create salekin-dev` (pick something near your Vercel region, e.g. `lhr`).
4. Create a token: `turso db tokens create salekin-dev --expiration none` (use a named token if you'd rather rotate).
5. Capture two values:
   - `TURSO_DATABASE_URL` — looks like `libsql://salekin-dev-<org>.turso.io`
   - `TURSO_AUTH_TOKEN` — the token string from step 4.

### 2. Prisma: switch from native SQLite to the libSQL adapter

> **Status:** ✅ done. `prisma/schema.prisma` enables the
> `driverAdapters` preview feature, `lib/db.ts` branches on `NODE_ENV`
> to use `PrismaLibSQL` in production, and `lib/env.ts` accepts the
> `TURSO_*` variables. Verified: `pnpm typecheck && pnpm test (169/169) &&
> pnpm build` all pass; the production code path loads cleanly when
> imported with stub Turso credentials.

**What changed in this repo:**

- `prisma/schema.prisma` — `previewFeatures = ["driverAdapters"]`
- `lib/db.ts` — branches on `NODE_ENV`:
  ```ts
  if (env.NODE_ENV === 'production' && env.TURSO_DATABASE_URL) {
    const libsql = createLibsqlClient({ url, authToken });
    return new PrismaClient({ adapter: new PrismaLibSQL(libsql), log });
  }
  return new PrismaClient({ log });
  ```
- `lib/env.ts` — adds `TURSO_DATABASE_URL` (optional `z.string().url()`)
  and `TURSO_AUTH_TOKEN` (optional). Production requires both together.
- `package.json` — runtime deps: `@prisma/adapter-libsql@5.22.0`,
  `@libsql/client@0.18.0`. Both pinned to match the Prisma 5 line.

**Why the type cast:** Prisma 5.22's public `adapter` field has a narrow
structural type that doesn't match the libSQL adapter's runtime shape
(verified at boot by `prisma db push`). The `as unknown as never` cast
is local to the one construction site in `lib/db.ts`.

### 3. Push the schema

```bash
# Local first, sanity check:
pnpm db:push

# Then push to Turso. The wrapper at scripts/db-push-turso.ts rewrites
# TURSO_* into the DATABASE_URL + DATABASE_AUTH_TOKEN shape that
# `prisma db push` expects (the schema's `url = env("DATABASE_URL")` is
# fixed for local dev + Vercel build, so we override at the wrapper).
TURSO_DATABASE_URL=libsql://salekin-dev-<org>.turso.io \
TURSO_AUTH_TOKEN=... \
  pnpm db:push:turso
```

The seed is idempotent. Run it once after the first push so the production
DB starts with the same content as local:

```bash
TURSO_DATABASE_URL=libsql://salekin-dev-<org>.turso.io \
TURSO_AUTH_TOKEN=... \
  pnpm db:seed:turso
```

### 4. Vercel project

1. Push the repo to GitHub.
2. Import in Vercel — it auto-detects Next.js.
3. **Build command**: leave as default (`next build`).
4. **Environment variables** (Project Settings → Environment Variables, all "Production"):
   - `NODE_ENV` = `production` (Vercel sets this by default, but be explicit)
   - `DATABASE_URL` = `file:./dev.db` (used only at build time for `prisma generate`; never reached at runtime)
   - `TURSO_DATABASE_URL` = the libsql:// URL from step 1
   - `TURSO_AUTH_TOKEN` = the token from step 1
   - `SITE_URL` = `https://salekin.dev`
   - `ADMIN_PASSWORD` = a strong password (you'll type this on /admin/login)
   - `ADMIN_SESSION_SECRET` = a 32+ char random string — `openssl rand -base64 48`
5. **Domain**: Settings → Domains → add `salekin.dev`. Follow the DNS instructions at your registrar (Vercel shows the exact A/ALIAS/CNAME records). www → apex redirect: toggle in the project settings.
6. **TLS** is automatic once DNS resolves.

## Continuous deployment

Push to `main` → Vercel builds. No extra steps.

If you add an admin-only migration or seed change:

```bash
# After committing the seed change:
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... pnpm db:seed:turso
```

(Or write a one-off script under `scripts/` and run it locally. Don't bake seeds into the build.)

## Backups

Two paths:

1. **One-click JSON snapshot**: log in at `/admin/login`, click "export data" in the top-right. Browser saves `specMd-backup-<timestamp>.json`. Run on a schedule (or just before risky schema edits).
2. **Turso native**: `turso db shell salekin-dev ".dump" > backup-$(date +%F).sql` writes a portable SQL dump.

## Smoke test after deploy

```bash
curl -fsSL https://salekin.dev/ > /dev/null && echo "home OK"
curl -fsSL https://salekin.dev/admin > /dev/null && echo "admin OK"
curl -fsSL https://salekin.dev/admin/export -o /tmp/snap.json \
  -b "admin_session=$(node -e '...forge cookie...')" && echo "export OK"
```

Then open `/admin` in a browser, sign in, hit "export data", eyeball the JSON.

## What can go wrong

- **`prisma generate` runs on Vercel but the adapter is missing** → install `@prisma/adapter-libsql` and `@libsql/client` as regular `dependencies`, not `devDependencies`. (See step 2 — this swap is not yet committed.)
- **Cold-start latency** — first request after idle is ~300ms-1s on the Vercel free tier. Acceptable for a personal site.
- **`/admin/export` auth** — the route gates on `ADMIN_PASSWORD`. If unset, the gate is off (handy for previews). In production: **always** set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to non-trivial values.
- **Forgotten `SITE_URL`** — OpenGraph and canonical URLs fall back to `http://localhost:3000`. Set `SITE_URL=https://salekin.dev` before going live or social previews will look broken.
- **CV file** — `prisma/seed.ts` writes `/Md_Salekin_Newaz.pdf` as the `cv_url` setting. Drop it there before the first deploy.

## Local development with Turso

If you want to point local dev at the production DB for testing:

```bash
export TURSO_DATABASE_URL=libsql://salekin-dev-<org>.turso.io
export TURSO_AUTH_TOKEN=...
pnpm dev
```

Otherwise leave `DATABASE_URL=file:./dev.db` and the local SQLite file is used.