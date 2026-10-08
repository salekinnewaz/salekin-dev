# Deploying salekin.dev

Single-author personal site. Vercel for hosting, Turso (libSQL) for the database, provisioned through the Vercel Marketplace integration.

## Current state

✅ **Deployed to Vercel** at https://salekin-dev.vercel.app. Build is green, all routes serve 200.

✅ **Production DB is Turso** (`libsql://salekin-dev-vercel-icfg-…aws-us-east-1.turso.io`), provisioned and connected by the Vercel ↔ Turso marketplace integration. `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` are set as encrypted Vercel env vars; the runtime `lib/db.ts` branches on `NODE_ENV` to use `PrismaLibSQL` in production. Schema is pushed (13 tables) and seeded (5 experiences, 3 educations, 23 settings).

✅ **Custom domain** is **not** yet wired; the site is live only at the Vercel subdomain. Adding `salekin.dev` is a dashboard step (DNS at the registrar).

## Architecture

- **App**: Next.js 15 App Router, React 19, server components + server actions.
- **DB**: Prisma 5.22 with `driverAdapters` preview feature. Locally: `file:./dev.db`. In production: Turso (libSQL) via `@prisma/adapter-libsql`.
- **Auth on the Turso side**: OIDC JWT minted by the Vercel integration, stored as the `TURSO_AUTH_TOKEN` env var. No static long-lived secret; the token is verified by Turso against Vercel's OIDC issuer.
- **Files**: A few static assets (`/resume.pdf`, og-image route, CV download tracker). No S3 / R2.
- **Email**: `Contact` form persists to the DB; no outbound mail.
- **Cron / background work**: none.

## One-time setup (already done)

### Turso via the Vercel Marketplace integration

This is the path that was actually used; the manual `turso auth login` flow is documented at the bottom for reference.

```bash
# 1. Install the Turso integration against the project.
#    The CLI walks through terms acceptance in the browser once.
vercel integration add tursocloud/database \
  -m region=iad1 \
  --plan starter \
  -n salekin-dev \
  -e production

# 2. Pull the resulting env vars to a local file so we can use them
#    outside the Vercel runtime.
vercel env pull .env.production.pull --environment production

# 3. Push the Prisma schema. The wrapper at scripts/db-push-turso.ts
#    generates DDL from prisma/schema.prisma via
#    `prisma migrate diff --from-empty --to-schema-datamodel` and
#    applies each statement through @libsql/client directly. We can't
#    use `prisma db push` because Prisma 5.22's `provider = "sqlite"`
#    requires a `file:` URL at config validation time, even though
#    the runtime uses the libSQL driver adapter.
set -a; source .env.production.pull; set +a
pnpm db:push:turso

# 4. Seed. prisma/seed.ts now imports `db` from lib/db.ts so it uses
#    the same libSQL client the app uses at runtime.
pnpm db:seed:turso
```

The seed is idempotent. Re-run after schema changes.

### Local config

Once the integration is installed and env vars are set on Vercel, you don't need any local config — `vercel env pull` gives you whatever you need for local scripts that want to talk to the prod DB. The `dev.db` flow (default) is unchanged for normal dev work.

## Vercel project

The `salekin-dev` project is already on Vercel and deployed to production at https://salekin-dev.vercel.app.

**To make it git-driven** (auto-deploy on push to main), connect GitHub in the dashboard:
Project → Settings → Git → Connect → pick `salekinnewaz/salekin-dev`. The Vercel CLI can't do this one-time OAuth handshake for you.

Until then, deploy via:
```bash
pnpm deploy          # runs scripts/deploy.sh, which is `vercel deploy --target production`
```

The production env vars are all set:

- `TURSO_DATABASE_URL` — set by the Vercel ↔ Turso integration, encrypted
- `TURSO_AUTH_TOKEN` — same
- `DATABASE_URL` — `file:./dev.db` (build-time only, for `prisma generate`)
- `SITE_URL` — `https://salekin.dev`
- `ADMIN_PASSWORD` — generated, see `.env.admin.production` locally
- `ADMIN_SESSION_SECRET` — generated, see `.env.admin.production` locally

**Custom domain**: Settings → Domains → add `salekin.dev` → set the DNS records Vercel shows at your registrar.

## Continuous deployment

After the one-time GitHub handshake, push to `main` → Vercel auto-builds.

Until then: `pnpm deploy`.

If you add an admin-only migration or seed change:
```bash
vercel env pull .env.production.pull --environment production
set -a; source .env.production.pull; set +a
pnpm db:push:turso    # only if schema changed
pnpm db:seed:turso
```

(Or write a one-off script under `scripts/` and run it locally. Don't bake seeds into the build.)

## Backups

1. **One-click JSON snapshot**: log in at `/admin/login`, click "export data" in the top-right. Browser saves `specMd-backup-<timestamp>.json`. Run on a schedule (or just before risky schema edits).
2. **Turso native**: the Vercel integration exposes a resource; you can also install the standalone `turso` CLI and use `turso db shell <name> ".dump"` (see manual path below).

## Smoke test after deploy

```bash
curl -fsSL https://salekin-dev.vercel.app/ > /dev/null && echo "home OK"
curl -fsSL https://salekin-dev.vercel.app/projects > /dev/null && echo "projects OK"
curl -fsSL https://salekin-dev.vercel.app/admin/login > /dev/null && echo "admin OK"
```

Then open `/admin/login` in a browser, sign in, hit "export data", eyeball the JSON.

## What can go wrong

- **Cold-start latency** — first request after idle is ~300ms-1s on the Vercel free tier. Acceptable for a personal site.
- **`/admin/export` auth** — the route gates on `ADMIN_PASSWORD`. If unset, the gate is off. In production: **always** set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to non-trivial values.
- **Forgotten `SITE_URL`** — OpenGraph and canonical URLs fall back to `http://localhost:3000`. Set `SITE_URL=https://salekin.dev` before going live or social previews will look broken.
- **CV file** — `public/Md_Salekin_Newaz.pdf` is already in the repo and gets served at the `cv_url` setting. The seed points at `/Md_Salekin_Newaz.pdf` which Next serves from `public/`.
- **OIDC token expiry** — Vercel mints short-lived OIDC tokens for the Turso integration; Vercel rotates them automatically. If requests suddenly 401, run `vercel env pull` again and confirm the token format; then check the integration in the Vercel dashboard for any deauth state.

## Manual Turso path (not used here, but documented for future me)

If you ever want a Turso DB outside of the Vercel integration (e.g., for a different deployment target), the standalone CLI path is:

```bash
brew install tursodatabase/tap/turso   # or: curl + extract from GitHub releases
turso auth login                        # opens a browser; one-time OAuth
turso db create salekin-dev --location lhr
turso db tokens create salekin-dev --expiration none
# Then set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in Vercel manually.
```

The Vercel-integration path above is preferred because it auto-rotates credentials and shows usage in the Vercel dashboard.
