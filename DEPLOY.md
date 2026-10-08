# Deploying salekin.dev

Single-author personal site. Vercel for hosting, Turso for the database (libSQL-compatible SQLite, free tier is plenty).

## Current state (as of last deploy)

✅ **Deployed to Vercel** at https://salekin-dev.vercel.app. Build is green, all 13 routes serve 200, `/projects` lists the 3 projects from the local `dev.db` that was bundled into the build image.

⚠️ **DB is ephemeral on Vercel**: the deployed build is using `file:./dev.db` from the build context, which is a *snapshot* at build time. The next deploy will rebuild it from the same source — fine for now, but any admin-panel edits you make on the live site will NOT persist across deploys. Fix this by adding Turso (below).

## Architecture

- **App**: Next.js 15 App Router, React 19, server components + server actions.
- **DB**: Prisma + SQLite schema. Locally: `file:./dev.db`. In production: Turso (libSQL) reached via `@prisma/adapter-libsql`.
- **Files**: A few static assets (`/resume.pdf`, the og-image route, the CV download tracker). No S3 / R2 needed.
- **Email**: `Contact` form just persists to the DB; no outbound mail is sent.
- **Cron / background work**: none.

## One-time setup

### 1. Turso (the missing piece)

The site is deployable without Turso (the `lib/db.ts` branch falls
through to the placeholder `DATABASE_URL=file:./dev.db` if Turso vars
are unset), but admin edits won't persist. To get a real production DB:

**Easiest path** (no CLI): open the Vercel dashboard →
[salekin-dev project → Storage tab → Marketplace → search "Turso"]
(https://vercel.com/marketplace/turso). One click provisions a Turso
DB AND sets the `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` env vars in
the project. Then skip to step 3.

**Manual path** (if you want explicit control):

1. `npm i -g @tursodatabase/cli` (or `brew install tursodatabase/tap/turso`).
2. `turso auth login` (opens a browser).
3. `turso db create salekin-dev` (pick a region near Vercel, e.g. `lhr`).
4. `turso db tokens create salekin-dev --expiration none`.
5. Capture `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

### 2. Prisma: switch from native SQLite to the libSQL adapter

> **Status:** ✅ done. `prisma/schema.prisma` enables the
> `driverAdapters` preview feature, `lib/db.ts` branches on `NODE_ENV`
> to use `PrismaLibSQL` in production, and `lib/env.ts` accepts the
> `TURSO_*` variables. Verified: `pnpm typecheck && pnpm test (176/176) &&
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

### 3. Push the schema to Turso

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

### 4. Vercel project (already created)

The project `salekin-dev` is already on Vercel and has been deployed to
production at https://salekin-dev.vercel.app.

**To make it git-driven** (auto-deploy on push to main), you need to
connect the GitHub account in the Vercel dashboard one time:
Project → Settings → Git → Connect → pick `salekinnewaz/salekin-dev`.
This is a single click in the dashboard; the Vercel CLI can't do it
without that one-time OAuth handshake.

Until that handshake is done, deploy via:

```bash
pnpm deploy          # runs scripts/deploy.sh, which is `vercel deploy --target production`
```

The current Vercel env vars on the `salekin-dev` project are empty —
no `TURSO_*` etc. Set them in Project → Settings → Environment Variables
**Production** when you have the Turso credentials:

- `DATABASE_URL` = `file:./dev.db` (build-time only, for `prisma generate`)
- `TURSO_DATABASE_URL` = the `libsql://` URL
- `TURSO_AUTH_TOKEN` = the token
- `SITE_URL` = `https://salekin.dev`
- `ADMIN_PASSWORD` = a strong password
- `ADMIN_SESSION_SECRET` = `openssl rand -base64 48`

**Custom domain**: Settings → Domains → add `salekin.dev` → set the DNS
records Vercel shows at your registrar. (The `salekinnewaz.vercel.app`
URL is from a separate v0 project, not this one.)

## Continuous deployment

After the one-time GitHub handshake, push to `main` → Vercel auto-builds.

Until then: `pnpm deploy` (or `vercel deploy --target production`).

If you add an admin-only migration or seed change:

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... pnpm db:seed:turso
```

(Or write a one-off script under `scripts/` and run it locally. Don't bake seeds into the build.)

## Backups

Two paths:

1. **One-click JSON snapshot**: log in at `/admin/login`, click "export data" in the top-right. Browser saves `specMd-backup-<timestamp>.json`. Run on a schedule (or just before risky schema edits).
2. **Turso native**: `turso db shell salekin-dev ".dump" > backup-$(date +%F).sql` writes a portable SQL dump.

## Smoke test after deploy

```bash
curl -fsSL https://salekin-dev.vercel.app/ > /dev/null && echo "home OK"
curl -fsSL https://salekin-dev.vercel.app/projects > /dev/null && echo "projects OK"
curl -fsSL https://salekin-dev.vercel.app/admin/login > /dev/null && echo "admin OK"
```

Then open `/admin/login` in a browser, sign in, hit "export data", eyeball the JSON.

## What can go wrong

- **DB resets on every redeploy** — add Turso (step 1) so the DB is persistent.
- **Cold-start latency** — first request after idle is ~300ms-1s on the Vercel free tier. Acceptable for a personal site.
- **`/admin/export` auth** — the route gates on `ADMIN_PASSWORD`. If unset, the gate is off. In production: **always** set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to non-trivial values.
- **Forgotten `SITE_URL`** — OpenGraph and canonical URLs fall back to `http://localhost:3000`. Set `SITE_URL=https://salekin.dev` before going live or social previews will look broken.
- **CV file** — `public/Md_Salekin_Newaz.pdf` is already in the repo and gets served at the `cv_url` setting. The seed points at `/Md_Salekin_Newaz.pdf` which Next serves from `public/`.

## Local development with Turso

If you want to point local dev at the production DB for testing:

```bash
export TURSO_DATABASE_URL=libsql://salekin-dev-<org>.turso.io
export TURSO_AUTH_TOKEN=...
pnpm dev
```

Otherwise leave `DATABASE_URL=file:./dev.db` and the local SQLite file is used.