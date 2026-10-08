# Portfolio Site — Implementation Plan

> Generated via specsmd AI-DLC
> Status: Inception complete, ready for construction
> Date: 2026-10-07

This is the human-readable summary of the plan. All machine-readable artifacts are in `.specsmd/` and `memory-bank/` per the specsmd schema.

---

## Goal

A 4-page portfolio site with database-backed content:

- **Home** — hero + featured work
- **Projects** — list + detail
- **About** — bio + experience timeline
- **Contact** — form (persists to DB)

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite |
| ORM | Prisma 5 |
| Forms | react-hook-form + zod |
| Package manager | pnpm |
| Tests | Vitest + Testing Library |

---

## Pages & Data

```text
/                          Home         → settings + getFeaturedProjects
/projects                  Projects list → listPublishedProjects
/projects/[slug]           Project detail → getProjectBySlug
/about                     About        → settings + listExperiencesOrdered
/contact                   Contact form → submits to Contact table
```

### Database (SQLite via Prisma)

| Table | Purpose | Key fields |
|-------|---------|------------|
| `projects` | Portfolio items | slug, title, description, imageUrl, repoUrl, liveUrl, techStack (JSON), featured, publishedAt |
| `experiences` | Work history | company, role, startDate, endDate, description, sortOrder |
| `contacts` | Form submissions | name, email, message, createdAt, read |
| `settings` | Site config (KV) | key, value |

---

## Units (independently shippable work blocks)

### Unit 001 — Content Layer (Bolt 1, foundation)

**Owns**: `prisma/`, `lib/db.ts`, `lib/queries/`, `lib/validation/contact.ts`, seed data.

**Stories**:
1. Database schema
2. Prisma client singleton + query helpers
3. Seed data

### Unit 002 — Public Site (Bolt 2)

**Owns**: All 4 pages, header/footer, ProjectCard, ExperienceItem, layout.

**Stories**:
1. Layout & design system
2. Home page
3. Projects list + detail
4. About page

**Depends on**: Unit 001.

### Unit 003 — Contact Form (Bolt 3)

**Owns**: ContactForm component, server action, validation wiring.

**Stories**:
1. Form UI + client validation
2. Server action + DB persistence

**Depends on**: Unit 001.

---

## Bolt Execution Order

```text
Bolt 001 (Content Layer)
     │
     ├──> Bolt 002 (Public Site)
     │
     └──> Bolt 003 (Contact Form)
```

Bolts 002 and 003 can run in parallel once 001 is done.

Each bolt follows DDD / Simple Construction stages:
- **Bolt 1 (DDD)**: domain-model → technical-design → implement → test
- **Bolts 2, 3 (Simple)**: spec → implement → test

---

## File Layout (target)

```text
.
├── PLAN.md                     ← this file
├── README.md                   ← (to be created in Bolt 1)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env / .env.example
├── .gitignore
├── app/
│   ├── layout.tsx              ← Bolt 2
│   ├── globals.css
│   ├── page.tsx                ← Home
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── about/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── ui/                     ← shadcn primitives (Bolt 2)
│   └── site/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── ProjectCard.tsx
│       ├── ExperienceItem.tsx
│       └── ContactForm.tsx     ← Bolt 3
├── lib/
│   ├── db.ts                   ← Bolt 1
│   ├── utils/cn.ts             ← Bolt 2
│   ├── queries/
│   │   ├── projects.ts
│   │   ├── experiences.ts
│   │   └── settings.ts
│   ├── actions/
│   │   └── contact.ts          ← Bolt 3
│   └── validation/
│       └── contact.ts          ← Bolt 1, reused Bolt 3
├── prisma/
│   ├── schema.prisma           ← Bolt 1
│   └── seed.ts
├── public/
│   └── (images)
├── tests/
│   └── (vitest specs)
├── memory-bank/                ← specsmd artifacts (existing)
└── .specsmd/                   ← specsmd framework (existing)
```

---

## Risks & Trade-offs

| Risk | Decision |
|------|----------|
| SQLite single-writer | Acceptable for portfolio traffic; document migration path |
| No email on contact | Owner must check DB; email integration is a later bolt |
| No admin UI | Use Prisma Studio or `pnpm db:seed` for v1 |

---

## How to Continue

When ready to start:

1. Move to Bolt 001 (Content Layer) — it's the foundation
2. Read `memory-bank/bolts/001-content-layer/bolt.md`
3. Execute its DDD stages in order
4. Mark stages complete in frontmatter

Open in puku-cli and the specsmd agents will pick up from here. The skill files are in `.claude/skills/` (4 agents) and the full skill catalog is in `.specsmd/aidlc/skills/`. They will work in future puku-cli sessions once the session is restarted (skills are discovered at session start).