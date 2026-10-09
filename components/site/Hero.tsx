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
 * Hero — first fold, calm and editorial. Matches the v3 design brief:
 *
 *   - Eyebrow: `— ISTQB® CERTIFIED · OPEN TO INTERESTING WORK`
 *     (uppercase mono with a leading purple dash, no `$` prefix)
 *   - H1: `Salekin` (white) + `Newaz` (purple→cyan gradient), rendered
 *     inline on a single line. The data is `Md Salekin Newaz`; the
 *     `Md` prefix is intentionally omitted from the hero H1 because
 *     the brief renders the person-facing name only.
 *   - Role strap: `SENIOR SOFTWARE QA ENGINEER` (large uppercase
 *     mono, accent-colored).
 *   - Secondary strap: `PLAYWRIGHT · AI-DRIVEN QA · QUALITY
 *     ENGINEERING` (uppercase mono, muted).
 *   - Tagline (the brief §3 positioning line).
 *   - 2 CTAs: `View My Work` (gradient fill) + `Download Resume`
 *     (outline).
 *   - FOCUS row: 4 icon-prefixed chips on the left, matching the 4
 *     floating info cards around the profile photo on the right.
 *   - Status line: `● Senior Software QA Engineer @ Brain Station 23 ·
 *     Dhaka, Bangladesh`.
 *   - HeroStage on the right (large photo + 4 orbit cards + terminal).
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
  const location = identity.contactLocation?.trim();

  // The H1 in the hero intentionally shows the person-facing name
  // (e.g. "Salekin Newaz") without the honorific "Md" prefix that
  // the site metadata uses. Split into first / last so the gradient
  // can be applied to the last name only.
  const nameParts = title.replace(/^Md\.?\s+/i, '').trim().split(/\s+/);
  const firstName = nameParts[0] ?? title;
  const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

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
            className="eyebrow flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-fg-2 hero-stagger"
            style={{ animationDelay: '0ms' }}
          >
            <span aria-hidden="true" className="text-accent">—</span>
            ISTQB® Certified · open to interesting work
          </span>

          <h1
            className="heading-display flex flex-wrap items-baseline gap-x-6 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl xl:text-[6rem] hero-stagger"
            data-hero-headline
            style={{ animationDelay: '80ms' }}
          >
            <span className="text-fg">{firstName}</span>
            <span className="name-gradient">{lastName}</span>
          </h1>

          <p
            className="font-mono text-sm uppercase tracking-widest text-accent sm:text-base hero-stagger"
            style={{ animationDelay: '160ms' }}
          >
            Senior Software QA Engineer
          </p>

          <p
            className="font-mono text-xs uppercase tracking-widest text-muted sm:text-sm hero-stagger"
            style={{ animationDelay: '200ms' }}
          >
            Playwright <span aria-hidden="true" className="text-fg-2/50">·</span>{' '}
            AI-Driven QA{' '}
            <span aria-hidden="true" className="text-fg-2/50">·</span>{' '}
            Quality Engineering
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
            <Link
              href="/#work"
              className="btn-primary magnetic inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base"
            >
              View My Work
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="/cv-download"
              className="btn-outline magnetic inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base"
            >
              <span aria-hidden="true">↓</span>
              Download Resume
            </a>
          </div>

          <ul
            aria-label="Focus areas"
            className="mt-2 flex flex-wrap items-center gap-2 hero-stagger"
            style={{ animationDelay: '400ms' }}
          >
            <li className="font-mono text-xs uppercase tracking-widest text-muted">
              FOCUS
            </li>
            {chipAreas.map((c) => (
              <li key={c.label}>
                <FocusChip icon={c.icon} label={c.label} />
              </li>
            ))}
          </ul>

          <p
            className="float-soft inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-widest text-muted"
            style={{ animationDelay: '1.5s' }}
          >
            <span
              className="relative inline-flex h-1.5 w-1.5"
              aria-hidden="true"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-fg-2">
              Senior Software QA Engineer @ Brain Station 23
            </span>
            {location ? (
              <>
                <span aria-hidden="true" className="text-fg-2/50">|</span>
                <span className="normal-case tracking-normal">
                  {location}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <HeroStage src={photoSrc} alt={photoAlt} cards={orbitCards} />
      </div>
    </section>
  );
}
