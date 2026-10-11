# salekin-dev

> Personal portfolio of **Md Salekin Newaz — Senior Software QA Engineer** (ISTQB® Certified, Brain Station 23, Dhaka).

## 🌐 [salekin-dev.vercel.app](https://salekin-dev.vercel.app)

**The live site is here →** <https://salekin-dev.vercel.app>

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-salekin--dev.vercel.app-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://salekin-dev.vercel.app)
[![ISTQB Certified](https://img.shields.io/badge/ISTQB®-Certified-22c55e?style=for-the-badge&logo=istqb&logoColor=white)](https://salekin-dev.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma + Turso](https://img.shields.io/badge/Prisma_+_Turso-libSQL-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://turso.tech)

---

## What this is

The source for [salekin-dev.vercel.app](https://salekin-dev.vercel.app) — a single-author portfolio showcasing QA engineering work, projects, and credentials.

**Key pages:** hero with live terminal + animated capability orbit, experience timeline, recommendations, projects with markdown case studies, contact form (DB-persisted), admin panel.

**Highlights:**
- ⚡ **Next.js 15** App Router, React 19, server components + server actions
- 🎨 **Tailwind CSS 4** with custom design tokens (light + dark)
- 🗄️ **Prisma 5 + Turso** (libSQL) in production, SQLite locally
- 🧪 **Playwright** for E2E + visual regression
- 🤖 **AI-driven QA** theme — features a live `HeroTerminal` that types through a fixed script
- ♿ **a11y-first**: skip link, focus rings, reduced-motion respected everywhere
- 🔍 **SEO**: JSON-LD (`Person` + `WebSite` + `WebPage`), sitemap, robots.txt, OG image
- 📬 **Contact form** with rate limiting + spam guard, persists to DB

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite (local) / Turso libSQL (prod) |
| ORM | Prisma 5.22 (`driverAdapters`) |
| Forms | react-hook-form + zod |
| Auth | NextAuth (admin panel) |
| Email | Resend |
| Hosting | Vercel |
| Package manager | pnpm |

---

## Local development

```bash
# 1. Install
pnpm install

# 2. Set up local DB
pnpm db:push
pnpm db:seed

# 3. Run
pnpm dev          # http://localhost:3000
```

Requires Node 20+, pnpm 9+. See `.env.example` for required env vars (DB URL, auth secret, etc).

### Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run vitest unit + integration tests |
| `pnpm test:e2e` | Run Playwright E2E suite (chromium + iPhone 14) |
| `pnpm test:e2e:headed` | Playwright with a visible browser |
| `pnpm test:e2e:ui` | Playwright's interactive UI mode |
| `pnpm test:e2e:report` | Open the last HTML report |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | `next lint` |
| `pnpm db:push` | Push Prisma schema to DB |
| `pnpm db:seed` | Seed with sample data |
| `pnpm deploy` | Deploy to Vercel prod (requires `vercel login`) |

---

## Deployment

Deployed to **Vercel** at [salekin-dev.vercel.app](https://salekin-dev.vercel.app). See [`DEPLOY.md`](./DEPLOY.md) for the full deployment architecture (Turso OIDC, Vercel env vars, marketplace integration, etc).

`git push origin main` is NOT yet wired to auto-deploy — run `vercel git connect` once in your local terminal to set that up.

---

## Project structure

```
app/                     # Next.js App Router pages
  page.tsx               # Home (hero + sections)
  about/                 # About page
  projects/[slug]/       # Project case studies (markdown)
  contact/               # Contact form
  admin/                 # Admin panel (auth-gated)
  api/                   # Route handlers
components/site/         # Hero, sections, cards
lib/                     # DB, queries, auth, utils
prisma/                  # Schema + migrations
public/                  # Static assets
scripts/                 # Deploy + maintenance scripts
tests/                   # Vitest setup + helpers
tests/e2e/               # Playwright specs (15 files, ~56 cases)
  00-smoke.spec.ts       # Every public route returns 200 + body
  01-home-hero.spec.ts   # Hero, focus chips, orbit, terminal, availability badge
  02-home-sections.spec.ts
  03-about.spec.ts
  04-projects.spec.ts
  05-project-detail.spec.ts
  06-contact-form.spec.ts # RHF + zod + honeypot + success
  07-cv-download.spec.ts
  08-theme-toggle.spec.ts
  09-header-nav.spec.ts          # Desktop
  09-header-nav.mobile.spec.ts   # iPhone (mobile project)
  10-admin-auth.spec.ts
  11-404.spec.ts
  12-a11y.spec.ts                # axe-core scan
  13-responsive.spec.ts
  14-skip-link.spec.ts
  15-terminal-easter-egg.spec.ts
```

---

## License

MIT — see [LICENSE](./LICENSE) (add if/when you publish one).

---

**📫 [Get in touch](https://salekin-dev.vercel.app#contact)** · [LinkedIn](https://linkedin.com/in/salekinnewaz) · [Email](mailto:hello@salekin.dev)
