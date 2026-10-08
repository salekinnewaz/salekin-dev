import { SectionDivider } from './SectionDivider';

type ApproachItem = {
  index: string;
  title: string;
  blurb: string;
  caption: string;
};

/**
 * 6 cards describing how I actually ship software. Copy is grounded
 * in the codebase (no fabricated metrics or fictional tools):
 *   01 / 02 — UI architecture choices you can see in the repo
 *   03      — Server actions + zod, used in lib/actions/**
 *   04      — Prisma + libSQL/Turso, used everywhere data is read
 *   05      — vitest + RTL, currently 176/176 passing
 *   06      — Vercel deploys, atomic commits, lighthouse-clean
 */
const ITEMS: ApproachItem[] = [
  {
    index: '01',
    title: 'Architecture',
    blurb:
      'Server-first components, typed contracts at the boundary, and small composable pieces. No clever abstractions for their own sake.',
    caption: 'principles / boundary',
  },
  {
    index: '02',
    title: 'Frontend systems',
    blurb:
      'React 19, Next 15, accessible primitives. CSS variables for theming instead of runtime JS — fast and predictable.',
    caption: 'principles / ui',
  },
  {
    index: '03',
    title: 'Backend & APIs',
    blurb:
      'Server actions and route handlers with zod validation at the edge. Errors return shapes, not stacks.',
    caption: 'principles / api',
  },
  {
    index: '04',
    title: 'Data',
    blurb:
      'Prisma over libSQL/Turso, schema-first migrations, query ergonomics. Joins live in the DB, not in app code.',
    caption: 'principles / data',
  },
  {
    index: '05',
    title: 'Testing',
    blurb:
      'Vitest + React Testing Library for units and components, Playwright for visual smoke. 176/176 passing, run on every push.',
    caption: 'principles / qa',
  },
  {
    index: '06',
    title: 'Delivery',
    blurb:
      'Atomic commits, preview deploys on Vercel, no skipped hooks. Lighthouse-clean on every shipped page.',
    caption: 'principles / ship',
  },
];

export function ApproachSection() {
  return (
    <section
      id="approach"
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="flex flex-col gap-4 reveal">
        <SectionDivider name="approach" trailing="// how I ship" />
        <h2 className="heading-display text-4xl sm:text-5xl">
          <span className="font-mono text-accent-2">$</span>{' '}
          <span className="text-fg">ls</span>{' '}
          <span className="heading-gradient">~/.config/approach/</span>
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-fg-2 sm:text-lg text-pretty">
          <span className="font-mono text-accent-2">{'> '}</span>
          Six habits that show up in every commit — not a manifesto,
          just the way the code gets written.
        </p>
      </div>

      <ol
        aria-label="Engineering approach"
        className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 reveal-stagger"
      >
        {ITEMS.map((item) => (
          <li
            key={item.index}
            className="approach-card group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6"
          >
            {/* Soft accent glow on hover — borrows the .glow-card mouse
                tracking via inline CSS variables, but without the JS
                cost. The pseudo-element just stays pinned to center. */}
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-accent-2">
                [{item.index}]
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {item.caption}
              </span>
            </div>
            <h3 className="heading-display text-2xl text-fg">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-fg-2 text-pretty">
              {item.blurb}
            </p>
            <div className="mt-auto h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              <span className="text-accent">→</span> applied per commit
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
