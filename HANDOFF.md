# Handoff — Session State

> Living document for resuming work across sessions. Last updated 2026-10-11.
>
> Sibling docs: `README.md` (public intro), `DEPLOY.md` (Vercel + Turso setup), `PLAN.md` (original spec).
> Update this file whenever a meaningful piece of work lands or a known gotcha is discovered.

---

## 0. TL;DR — where we are

- **Live**: <https://salekin-dev.vercel.app> (Vercel, prod build from `main`)
- **Latest commit on `main`**: `431b630 fix(hero): restore 3be3cac hero + drop hero-stagger translateY to stop layout shift`
- **Working tree**: clean
- **CI**: GitHub Actions `.github/workflows/e2e.yml` runs typecheck + Vitest + Playwright (chromium) + `vercel deploy --prod` + Allure publish on `main` push. Last run: **green, 52/52 Playwright, deployed**.
- **DB**: Turso libSQL in prod (provisioned via Vercel Marketplace), seeded. Local dev uses `prisma/dev.db`.

---

## 1. Stack & repo shape

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15.5.27 (App Router) | React 19 server components + server actions |
| Language | TypeScript strict (`noUncheckedIndexedAccess`) | `pnpm typecheck` |
| Styling | Tailwind CSS 4 + custom design tokens | `app/globals.css` holds all keyframes + `.hero-*` etc. |
| DB | Prisma 5.22 (`driverAdapters` preview) | SQLite locally, Turso libSQL in prod |
| Forms | react-hook-form + zod | Contact form persists to DB |
| Auth | NextAuth-style password gate for `/admin` | `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` env |
| Email | Resend (configured, not actively sending) | DB-persisted, no outbound mail yet |
| Hosting | Vercel | GitHub auto-deploy via CI workflow (not Vercel GitHub App) |
| Tests | Vitest (unit/jsdom) + Playwright (E2E) | 208 unit, 52 E2E |
| Reporting | Allure (`allure-playwright`) | Published to GitHub Pages by CI |

### Top-level layout

```
app/                          App Router routes + globals.css
components/site/              Hero, HeroOrbit, HeroTerminal, FocusChip, AvailabilityBadge, …
components/admin/             /admin/* pages
lib/queries/                  Prisma data access (getFeaturedProjects, getExperience, …)
lib/actions/                  Server actions (contact, admin)
lib/terminal/                easter-egg terminal command palette
lib/security/                 rate-limit, session
lib/icons.tsx                 icon registry (playwright / ai / api / cicd / …)
prisma/                       schema.prisma, seed.ts, dev.db, test.db
tests/e2e/                    *.spec.ts (16 files), pages/, utils/
public/images/                /images/profile.jpg (used by HeroOrbit)
public/resume.pdf             served by /cv-download
scripts/                      indexnow-ping.mjs (postbuild)
.github/workflows/e2e.yml     Build → Playwright → Deploy to Vercel → Allure
```

---

## 2. Commit timeline (recent)

```
431b630 fix(hero): restore 3be3cac hero + drop hero-stagger translateY to stop layout shift
80db032 fix(portfolio): content accuracy, dedup, and visual hierarchy
83d5de9 feat(e2e): custom Allure 2 dark theme + branded report generator
45f7d73 refactor(e2e): extract Page Object Model for all 16 specs
0a881ef fix(ci): let configured reporters run, don't override with --reporter
ae16269 fix(ci): grant contents: write to the pages job
82f913e fix(ci): publish Allure to Pages via gh-pages branch
b6327c3 docs: document Allure report + auto-deploy in README
3a67aa4 test(e2e): integrate Allure reporting
d0bb4c5 test(theme): use main toggle for dark → light flip
1999900 ci: auto-deploy to Vercel on push to main (after E2E)
```

`3be3cac` is the pre-`80db032` "good" Hero commit — the one the user explicitly approved before `80db032` over-pruned it. Reverting Hero to `3be3cac` is the baseline state.

---

## 3. What just shipped — Hero revert + layout-shift fix (`431b630`)

**Why**: user reviewed the deployed `https://salekin-dev.vercel.app/` and asked for two coupled changes:

1. **Hero was over-pruned in `80db032`** — that refactor removed the ISTQB® eyebrow chip, the FOCUS chip row, the `Playwright · AI-Driven QA · Quality Engineering` skill line, two of the four orbit cards (API Testing, CI/CD), the decorative orbit orbs and rings, the pulsing status line, and renamed the primary CTA from "View My Work" to "Explore My Work". User said the previous version looked better → **full revert to `3be3cac`**.
2. **Layout shift under the hero** — `@keyframes hero-stagger-in` animated each child from `translateY(8px)` to `translateY(0)`. The hero is a normal in-flow element so it was 8px shorter during the animation, pushing every section below it down 8px when the cascade finished. User said only the first fold should move, not the rest of the page → **opacity-only fade**.

### Files changed (4 files, +171 / -69)

1. **`components/site/Hero.tsx`** — literal revert to `3be3cac` (282 lines):
   - `<FocusChip>` re-joined
   - `FocusArea` type includes `label` again
   - Single `focusAreas: readonly FocusArea[]` source-of-truth with 4 entries: `playwright / ai / api / cicd` (positions `tl / tr / bl / br`, `bobDelay` `0 / 600 / 300 / 900`)
   - Left column (8 staggered children, delays 0 / 80 / 160 / 210 / 260 / 340 / 420 / 600 ms):
     - eyebrow row: `<span class="eyebrow eyebrow--muted availability-badge__cert">ISTQB® Certified</span>` + `<AvailabilityBadge />`
     - H1 "Salekin Newaz" with gradient
     - "Senior Software QA Engineer" mono accent
     - "Playwright · AI-Driven QA · Quality Engineering" skill line
     - tagline
     - CTAs: "View My Work" (primary) + "Download Resume" (outline)
     - `<ul aria-label="Focus areas">` with 4 `<FocusChip>`s
     - pulsing status line: `● Senior Software QA Engineer @ Brain Station 23 | Dhaka, Bangladesh`
   - Right column restored: `.hero-orbit-orbs` (3) + `.hero-orbit-rings` (4) inside `.hero-orbit-stage`, then `<HeroOrbit cards={orbitCards} ... />` with 4 cards
   - Grid: `lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]` (vs the over-pruned `1.1fr_1fr`)

2. **`app/globals.css`** lines 675–684 — dropped `transform: translateY(...)` from `@keyframes hero-stagger-in`, kept opacity-only. The `.hero-stagger` class (duration, easing, cascade) is untouched. Other keyframes (`brand-bob`, `float-soft`, `reveal`, `theme-menu-in`, `terminal-panel-in`, `caret-blink`, `hero-orbit-bob`, …) are untouched.

3. **`tests/e2e/01-home-hero.spec.ts`** — header comment + orbit-card test now asserts 4 cards (Playwright, AI-Driven QA, API Testing, CI/CD); CTA test asserts "View My Work".

4. **`tests/e2e/pages/HomePage.ts`** — `expectTwoOrbitCards()` → `expectFourOrbitCards()` with `toHaveCount(4)` and the four titles in order. Header + `orbitCards` getter comments rewritten.

### Verification (last run on `431b630`)

| Step | Result |
|---|---|
| `pnpm typecheck` | exit 0 |
| `pnpm test` | 208/208 vitest pass |
| `pnpm exec playwright test --project=chromium --workers=1` | 52/52 pass in 55.4 s |
| `pnpm build` | exit 0, `/` statically prerendered |
| GitHub Actions `.github/workflows/e2e.yml` | Build ✓, 52/52 ✓, **Deploy to Vercel (production) ✓** |
| Live `https://salekin-dev.vercel.app/` | `age: 0`, all restored markers present, fresh prod data present |

---

## 4. Known gotchas

These bit us at least once — re-read before touching the listed files.

### 4.1 Stale `next-server` on port 3000

Playwright config has `reuseExistingServer: !isCI` (true locally). A `next-server` left over from a previous Playwright run keeps port 3000 and the new `webServer` never starts. **Symptom**: a handful of tests fail with seemingly-random timeouts (often the admin-auth × 4, contact-form × 2, theme-toggle × 1) while the rest pass. **Fix**:

```bash
lsof -i :3000          # find them
kill <PID>             # or: pkill -f "next-server"  ;  pkill -f "next start"
```

### 4.2 Parallel-worker bottleneck on the local E2E run

`workers: isCI ? 1 : undefined` → **all CPUs in parallel locally**. 5+ workers against a single `next start` choke the server and tests time out. **Fix**: always pass `--workers=1` for local full-suite runs:

```bash
pnpm exec playwright test --project=chromium --workers=1
```

In CI it's already 1 worker (the `isCI` branch), so the CI run is the source of truth for "did the suite pass?"

### 4.3 Vercel `prisma generate` before build

Local `pnpm build` fails with `The table main.Setting does not exist in the current database` if `prisma/dev.db` doesn't have the schema. **Fix**:

```bash
DATABASE_URL="file:./dev.db" pnpm db:push
DATABASE_URL="file:./dev.db" pnpm db:seed
DATABASE_URL="file:./dev.db" \
  ADMIN_PASSWORD="test-admin-pass-1234" \
  ADMIN_SESSION_SECRET="playwright-e2e-session-secret-32+chars" \
  pnpm build
```

Vercel's prod build sets `DATABASE_URL` from env so it Just Works there.

### 4.4 Vercel prerender cache

The home page is statically prerendered at build time. **Symptom**: you update the Turso DB (e.g. new project, new recommendation) and the live HTML still shows the old data. **Fix**: re-seed prod Turso **and** redeploy — Vercel's prerender cache only busts on a fresh build:

```bash
DATABASE_URL="$TURSO_DATABASE_URL" \
TURSO_DATABASE_URL="$TURSO_DATABASE_URL" \
TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" \
SITE_URL="https://salekin-dev.vercel.app" \
pnpm db:seed:turso
# then trigger a redeploy — easiest: git commit --allow-empty && git push origin main
```

Confirm cache is fresh: `curl -I https://salekin-dev.vercel.app/ | grep -E "age|x-vercel-cache|x-nextjs-prerender"` — `age: 0`, `x-vercel-cache: MISS` on the first hit.

### 4.5 Vercel `vercel deploy --prod --token "$VERCEL_TOKEN"` lives in CI, not locally

`vercel` isn't on `$PATH` locally. The CI workflow `.github/workflows/e2e.yml` runs `vercel deploy --prod --yes --token "$VERCEL_TOKEN" --project prj_UejPnEPmnIel6eXz3HKsl6imzspm` after E2E. **Don't try to deploy from the shell** — push to `main` and let CI do it.

### 4.6 `[SENSITIVE]` Vercel env vars in `vercel env pull`

`vercel env pull` masks `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SITE_URL`, `DATABASE_URL`, `INDEXNOW_KEY`. For seeding prod Turso you need `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` — those **are** returned in cleartext and are sufficient. Set `SITE_URL="https://salekin-dev.vercel.app"` explicitly to bypass the env validator's URL check.

### 4.7 `FocusChip` / `<HeroOrbit>` / icons are still wired — don't re-add them

`components/site/FocusChip.tsx`, `components/site/HeroOrbit.tsx`, the `.hero-orbit-orbs` / `.hero-orbit-rings` CSS in `app/globals.css` (lines ~1947–2066), and the four icon ids `playwright / ai / api / cicd` in `lib/icons.tsx` all stayed in place through `80db032` — the only thing that changed was `Hero.tsx` stopped rendering them. If you ever want to slim the hero again, edit `Hero.tsx` only — don't delete the supporting components or icons.

### 4.8 `hero-stagger-in` is opacity-only by design — do not re-add `translateY`

Reintroducing `transform: translateY(8px)` brings back the layout-shift bug (every section below the hero moves down 8px when the cascade finishes). The fade-in visual is preserved with opacity-only animation. If you want a "lift" effect for the hero, do it via a different mechanism (e.g. an absolutely-positioned inner element with its own animation, leaving the outer container's geometry untouched).

---

## 5. How to resume work

### Local dev

```bash
cd /Users/salekinnewaz/Documents/Coding/portfolio/salekin-dev
pnpm install
DATABASE_URL="file:./dev.db" pnpm db:push
DATABASE_URL="file:./dev.db" pnpm db:seed
pnpm dev                                  # http://localhost:3000
```

### Local verification (use this before pushing)

```bash
pnpm typecheck
pnpm test                                 # vitest
pnpm exec playwright test --project=chromium --workers=1   # E2E, serial
DATABASE_URL="file:./dev.db" pnpm db:push
DATABASE_URL="file:./dev.db" pnpm db:seed
DATABASE_URL="file:./dev.db" \
  ADMIN_PASSWORD="test-admin-pass-1234" \
  ADMIN_SESSION_SECRET="playwright-e2e-session-secret-32+chars" \
  pnpm build
```

### Push + deploy

```bash
git add <files>
git commit -m "..."
git push origin main                      # triggers CI → Vercel prod deploy + Allure publish
gh run watch                               # tail the workflow run
```

### Re-seed prod Turso (rarely needed — only after content changes)

```bash
vercel env pull .env.production.pull --environment production
# (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN come back in cleartext;
#  ADMIN_PASSWORD / ADMIN_SESSION_SECRET / SITE_URL are [SENSITIVE]-masked.)

set -a; source .env.production.pull; set +a
export DATABASE_URL="$TURSO_DATABASE_URL" SITE_URL="https://salekin-dev.vercel.app"
pnpm db:seed:turso

# bust prerender cache:
git commit --allow-empty -m "chore: bust prerender cache after prod reseed"
git push origin main
```

---

## 6. Open / known issues

- **None currently tracked.** Hero + layout-shift shipped clean (`431b630`), CI green, prod live, working tree clean.
- The user's only outstanding wish before this handoff was the handoff itself.

---

## 7. Where to look when X is broken

| Symptom | First file to check |
|---|---|
| Hero looks like the over-pruned version | `components/site/Hero.tsx` — should match `3be3cac`'s 282-line shape |
| Sections below the hero shift down 8 px after page load | `app/globals.css` `@keyframes hero-stagger-in` — must be opacity-only |
| Live site shows old content after a DB change | Vercel prerender cache — re-seed Turso and redeploy (§4.4) |
| E2E fails on a handful of tests with timeouts | stale `next-server` on port 3000 (§4.1) or `--workers` (§4.2) |
| `pnpm build` fails with `Invalid environment variables: DATABASE_URL` | local `.env` is missing — use the `DATABASE_URL=...` prefix in §5 |
| `/admin/login` redirects to a wrong URL after deploy | `SITE_URL` env var on Vercel — set to `https://salekin-dev.vercel.app` |
| E2E test for orbit cards fails on count | `tests/e2e/pages/HomePage.ts` — `expectFourOrbitCards()` asserts 4, not 2 |
| Test data missing (no projects, etc.) | `prisma/dev.db` or `prisma/test.db` — re-run `db:push` + `db:seed` |
| AI / Playwright / API / CI/CD icon missing | `lib/icons.tsx` — ids `playwright`, `ai`, `api`, `cicd` must be registered |

---

## 8. Related docs

- `README.md` — public intro, feature list, quick start
- `DEPLOY.md` — Vercel + Turso provisioning, env vars, custom-domain notes
- `PLAN.md` — original specsmd inception plan (goal, pages, stack)
- `playwright.config.ts` — Playwright config (workers, projects, webServer env)
- `prisma/seed.ts` — DB seed (projects, experiences, education, settings)
- `.github/workflows/e2e.yml` — CI pipeline (typecheck → unit → E2E → deploy → Allure)

---

_Maintained by: Salekin Newaz. Update this file whenever a session ships something or discovers a new gotcha. Convention: the "TL;DR" at the top and the "What just shipped" section are the most likely things to be stale — keep those current._