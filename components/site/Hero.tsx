import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroStage } from './HeroStage';

type HeroProps = {
  identity: SiteIdentity;
};

/**
 * First fold.
 *   - Eyebrow status row
 *   - Big gradient display heading (title)
 *   - Role strap (engineering identity at a glance)
 *   - Tagline + subtitle
 *   - CTA row (primary + outline)
 *   - Stack chip line
 *   - ⌘K hint for the terminal easter-egg
 *   - HeroStage on the right: avatar over an animated terminal
 */
export function Hero({ identity }: HeroProps) {
  const title = identity.siteTitle || 'Salekin Newaz';
  const tagline = identity.siteTagline || 'Web developer building clean, fast user experiences.';
  const subtitle = identity.siteSubtitle || '';
  const initials = identity.siteInitials || 'SN';
  const location = identity.contactLocation || 'Dhaka, BD';
  const role = 'Software Engineer';
  const focus = 'Full-Stack · TypeScript · Next.js';

  // Stack chips — fixed short list. These match what's actually used in
  // the codebase (see lib/queries/site.ts SkillsByCategory) so we never
  // claim a tech we don't have below the fold.
  const stack = [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Prisma',
    'Tailwind',
  ] as const;

  return (
    <section
      id="hero"
      className="section-anchor relative flex min-h-[88vh] flex-col justify-center pb-16 pt-12 sm:pt-16"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
        <div className="reveal-stagger flex flex-col gap-6">
          <span className="eyebrow">
            <span aria-hidden="true" className="font-mono opacity-80">$</span>
            status --availability
            <span aria-hidden="true" className="font-mono text-accent-2/80">·</span>
            open
          </span>

          <h1
            className="heading-display heading-gradient text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
            data-hero-headline
          >
            <span className="block">{title.split(' ')[0]}</span>
            {title.split(' ').slice(1).length > 0 ? (
              <span className="block">{title.split(' ').slice(1).join(' ')}</span>
            ) : null}
          </h1>

          {/* Role strap — single line that says "who I am" at a glance.
              Engineering identity is the primary thing a recruiter needs
              to read in the first 5 seconds. */}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm uppercase tracking-widest text-fg-2 sm:text-base">
            <span className="text-accent">{role}</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>{focus}</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="relative inline-flex h-1.5 w-1.5"
                aria-hidden="true"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {location}
            </span>
          </p>

          <p className="max-w-2xl text-lg leading-relaxed text-fg-2 text-pretty sm:text-xl">
            <span className="font-mono text-accent-2">{'> '}</span>
            {tagline}
          </p>

          {subtitle ? (
            <p className="max-w-2xl text-sm text-muted sm:text-base">
              <span className="font-mono text-muted"># </span>
              {subtitle}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link href="/#contact" className="btn-primary magnetic">
              <span aria-hidden="true" className="font-mono text-fg-2/80">$</span>
              open ticket
              <span aria-hidden="true">→</span>
            </Link>
            <a href="/cv-download" className="btn-outline magnetic">
              <span aria-hidden="true" className="font-mono text-fg-2/80">$</span>
              grab resume.pdf
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a6 6 0 0 1-6-6" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
            <a href="/#work" className="btn-outline magnetic">
              <span aria-hidden="true" className="font-mono text-fg-2/80">$</span>
              view work
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* Stack chips — short, fixed list. Sits below the CTAs as a
              "by the way, here's what I work in" hint. */}
          <ul
            aria-label="Stack I work in"
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <li className="font-mono text-xs uppercase tracking-widest text-muted">
              stack ·
            </li>
            {stack.map((s) => (
              <li key={s}>
                <span className="tag">{s}</span>
              </li>
            ))}
          </ul>

          {/* ⌘K hint — discoverable affordance for the terminal
              easter-egg. Tiny and quiet; never demands attention. */}
          <p className="mt-1 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            <span className="text-accent-2">$</span>
            <span>try</span>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-fg-2">
              ⌘K
            </kbd>
            <span>for an interactive shell</span>
          </p>
        </div>

        <HeroStage initials={initials} />
      </div>
    </section>
  );
}
