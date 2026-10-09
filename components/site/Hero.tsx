import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroStage } from './HeroStage';
import { FocusChip } from './FocusChip';
import type { OrbitCard } from './HeroOrbit';
import type { FocusIconId } from '@/lib/icons';

type HeroProps = {
  identity: SiteIdentity;
};

type FocusArea = {
  id: string;
  icon: FocusIconId;
  label: string;
  detail: string;
  position: OrbitCard['position'];
  progress?: number;
  bobDelay: number;
};

/**
 * Hero — first fold, calm and editorial.
 *
 *   - Eyebrow status (ISTQB® Certified)
 *   - Big static-gradient H1 (full name)
 *   - 1-line role strap (Senior Software QA Engineer · Playwright ·
 *     AI-Driven QA)
 *   - Tagline (the brief §3 positioning line)
 *   - 2 CTAs (View My Work, Download Resume)
 *   - Focus row: 4 icon-prefixed chips on the left, matching the 4
 *     floating info cards around the profile photo on the right
 *   - "● Senior Software QA Engineer @ Brain Station 23" status line
 *   - HeroStage on the right (large photo + 4 orbit cards + terminal)
 *
 * The same 4 focus areas appear in both places — the left chip row
 * gives a quick at-a-glance scan, the right orbit gives the rich
 * detail. The `focusAreas` array is the single source of truth.
 */
export function Hero({ identity }: HeroProps) {
  const title = identity.siteTitle || 'Md Salekin Newaz';
  const tagline =
    identity.siteTagline ||
    'Building quality infrastructure that enables engineering teams to release with confidence.';
  const initials = identity.siteInitials || 'SN';
  // Real profile photo (served from /public). Falls back to the SVG
  // initials avatar only if the asset is missing.
  const photoSrc = '/images/profile.jpg';
  const photoAlt = `${title} — Senior Software QA Engineer`;

  // The 4 focus areas. Single source of truth — drives both the left
  // icon chip row and the right orbit cards. `position` and `bobDelay`
  // only matter for the orbit; the chip row ignores them.
  const focusAreas: readonly FocusArea[] = [
    {
      id: 'playwright',
      icon: 'playwright',
      label: 'Playwright',
      detail: 'E2E Automation',
      position: 'tl',
      progress: 0.92,
      bobDelay: 0,
    },
    {
      id: 'api',
      icon: 'api',
      label: 'API Testing',
      detail: 'REST · Swagger',
      position: 'bl',
      progress: 0.78,
      bobDelay: 600,
    },
    {
      id: 'ai',
      icon: 'ai',
      label: 'AI-Driven QA',
      detail: 'Smarter Testing',
      position: 'tr',
      bobDelay: 1200,
    },
    {
      id: 'cicd',
      icon: 'cicd',
      label: 'CI/CD',
      detail: 'Faster Releases',
      position: 'br',
      progress: 0.85,
      bobDelay: 1800,
    },
  ] as const;

  // Strip the orbit-only fields before passing to the chip row.
  const chipAreas = focusAreas.map(({ icon, label }) => ({ icon, label }));
  // The orbit consumes the full shape (position, progress, bobDelay).
  const orbitCards: OrbitCard[] = focusAreas.map(
    ({ id, icon, label, detail, position, progress, bobDelay }) => ({
      id,
      icon,
      title: label,
      detail,
      position,
      progress,
      bobDelay,
    }),
  );

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative flex min-h-[80vh] flex-col justify-center pb-16 pt-12 sm:pt-20"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-8">
          <span
            className="eyebrow hero-stagger"
            style={{ animationDelay: '0ms' }}
          >
            <span aria-hidden="true" className="font-mono opacity-80">$</span>
            ISTQB® Certified · open to interesting work
          </span>

          <h1
            className="heading-display text-5xl sm:text-6xl lg:text-7xl xl:text-[6rem] hero-stagger"
            data-hero-headline
            style={{ animationDelay: '80ms' }}
          >
            <span className="block text-fg">{title.split(' ')[0]}</span>
            {title.split(' ').slice(1).length > 0 ? (
              <span className="block text-gradient">
                {title.split(' ').slice(1).join(' ')}
              </span>
            ) : null}
          </h1>

          <p
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm uppercase tracking-widest text-fg-2 sm:text-base hero-stagger"
            style={{ animationDelay: '160ms' }}
          >
            <span className="float-soft text-accent">Senior Software QA Engineer</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>Playwright</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>AI-Driven QA</span>
          </p>

          <p
            className="max-w-2xl text-lg leading-relaxed text-fg-2 text-pretty sm:text-xl hero-stagger"
            style={{ animationDelay: '240ms' }}
          >
            {/* SEO: the full name appears in the tagline so the home page
                has the name in visible on-page text (not just the H1).
                Search engines weight body text heavily for name queries. */}
            {tagline.includes(identity.siteTitle)
              ? tagline
              : `I'm ${identity.siteTitle}. ${tagline}`}
          </p>

          <div
            className="mt-2 flex flex-wrap items-center gap-3 hero-stagger"
            style={{ animationDelay: '320ms' }}
          >
            <Link href="/#work" className="btn-primary">
              view my work
              <span aria-hidden="true">↓</span>
            </Link>
            <a href="/cv-download" className="btn-secondary">
              download resume
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <ul
            aria-label="Focus areas"
            className="mt-2 flex flex-wrap items-center gap-2 hero-stagger"
            style={{ animationDelay: '400ms' }}
          >
            <li className="font-mono text-xs uppercase tracking-widest text-muted">
              focus ·
            </li>
            {chipAreas.map((c) => (
              <li key={c.label}>
                <FocusChip icon={c.icon} label={c.label} />
              </li>
            ))}
          </ul>

          <p
            className="float-soft inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted"
            style={{ animationDelay: '1.5s' }}
          >
            <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span>
              <span className="text-fg-2">Senior Software QA Engineer @</span>{' '}
              Brain Station 23
            </span>
          </p>
        </div>

        <HeroStage src={photoSrc} alt={photoAlt} cards={orbitCards} />
      </div>
    </section>
  );
}
