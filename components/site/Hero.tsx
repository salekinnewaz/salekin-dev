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
 * Hero — first fold. Pixel-accurate re-implementation of the v3
 * design brief. Two-column grid inside a 1440px-wide container:
 *
 *   LEFT (~50%):
 *     • Eyebrow: `ISTQB® CERTIFIED · OPEN TO INTERESTING WORK`
 *       (uses the existing .eyebrow class — auto leading 40px
 *       purple line + uppercase mono).
 *     • H1: `Salekin` (white) + `Newaz` (purple→cyan gradient),
 *       on ONE SINGLE LINE at desktop. `whitespace-nowrap` +
 *       a `clamp()` font-size keep it on one line down to the
 *       brief's reference viewport (~1440px) and gracefully
 *       scale down. The data is `Md Salekin Newaz`; the `Md`
 *       honorific is intentionally omitted from the hero H1.
 *     • `SENIOR SOFTWARE QA ENGINEER` (accent, mono, uppercase).
 *     • `PLAYWRIGHT · AI-DRIVEN QA · QUALITY ENGINEERING`
 *       (muted, mono, uppercase).
 *     • Tagline + 2 CTAs (`View My Work` gradient, `Download
 *       Resume` outline — no magnetic effect so buttons stay
 *       visually static on hover per brief).
 *     • FOCUS row: 4 icon chips + a `FOCUS` label.
 *     • Status line: `● SENIOR SOFTWARE QA ENGINEER @ BRAIN
 *       STATION 23 | Dhaka, Bangladesh`.
 *
 *   RIGHT (~50%):
 *     • Photo (real, from /images/profile.jpg) inside a circular
 *       gradient ring (purple→cyan), with a soft glow halo.
 *     • 4 capability cards (Playwright / API Testing / AI-Driven
 *       QA / CI/CD) anchored at the four corners of the photo.
 *     • Terminal card below the photo + orbit.
 *
 * The 4 focus areas are the single source of truth for both the
 * left chips and the right orbit. `position` and `bobDelay` only
 * matter for the orbit; the chip row ignores them.
 */
export function Hero({ identity }: HeroProps) {
  const title = identity.siteTitle || 'Md Salekin Newaz';
  const tagline =
    identity.siteTagline ||
    'Building quality infrastructure that enables engineering teams to release with confidence.';
  // Real profile photo (served from /public). Falls back to the SVG
  // initials avatar only if the asset is missing.
  const photoSrc = '/images/profile.jpg';
  const photoAlt = `${title} — Senior Software QA Engineer`;
  const location = identity.contactLocation?.trim();

  // Strip the honorific "Md" prefix from the data so the gradient
  // sits cleanly on the last name only. Fallback to the full title
  // if the data is unexpected.
  const nameParts = title.replace(/^Md\.?\s+/i, '').trim().split(/\s+/);
  const firstName = nameParts[0] ?? title;
  const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

  // The 4 focus areas. Single source of truth.
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

  const chipAreas = focusAreas.map(({ icon, label }) => ({ icon, label }));
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
      className="section-anchor relative pb-20 pt-14 sm:pt-20 lg:pt-24"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-x-16">
        {/* ─── LEFT column — copy + CTAs ─── */}
        <div className="flex max-w-[640px] flex-col gap-7 lg:max-w-none">
          <span
            className="eyebrow eyebrow--muted hero-stagger"
            style={{ animationDelay: '0ms' }}
          >
            ISTQB® Certified · Open to Interesting Work
          </span>

          <h1
            className="heading-display whitespace-nowrap text-[clamp(2.75rem,5.4vw,5.25rem)] leading-[1.02] tracking-tight hero-stagger"
            data-hero-headline
            style={{ animationDelay: '80ms' }}
          >
            <span className="text-fg">{firstName}</span>{' '}
            <span className="name-gradient">{lastName}</span>
          </h1>

          <p
            className="font-mono text-sm uppercase tracking-[0.18em] text-accent sm:text-[0.95rem] hero-stagger"
            style={{ animationDelay: '160ms' }}
          >
            Senior Software QA Engineer
          </p>

          <p
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted sm:text-[0.78rem] hero-stagger"
            style={{ animationDelay: '210ms' }}
          >
            Playwright{' '}
            <span aria-hidden="true" className="text-fg-2/50">
              ·
            </span>{' '}
            AI-Driven QA{' '}
            <span aria-hidden="true" className="text-fg-2/50">
              ·
            </span>{' '}
            Quality Engineering
          </p>

          <p
            className="max-w-[540px] text-[1.05rem] leading-[1.65] text-fg-2 text-pretty sm:text-[1.18rem] hero-stagger"
            style={{ animationDelay: '260ms' }}
          >
            {tagline.includes(identity.siteTitle)
              ? tagline
              : `I'm ${identity.siteTitle}. ${tagline}`}
          </p>

          <div
            className="flex flex-wrap items-center gap-3 hero-stagger"
            style={{ animationDelay: '340ms' }}
          >
            <Link
              href="/#work"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-[0.95rem]"
            >
              View My Work
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="/cv-download"
              className="btn-outline inline-flex items-center gap-2 px-6 py-3.5 text-[0.95rem]"
            >
              <span aria-hidden="true">↓</span>
              Download Resume
            </a>
          </div>

          <ul
            aria-label="Focus areas"
            className="flex flex-wrap items-center gap-2 hero-stagger"
            style={{ animationDelay: '420ms' }}
          >
            <li className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              FOCUS
            </li>
            {chipAreas.map((c) => (
              <li key={c.label}>
                <FocusChip icon={c.icon} label={c.label} />
              </li>
            ))}
          </ul>

          <p
            className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted hero-stagger"
            style={{ animationDelay: '600ms' }}
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
                <span className="normal-case tracking-normal">{location}</span>
              </>
            ) : null}
          </p>
        </div>

        {/* ─── RIGHT column — orbit + terminal ─── */}
        <HeroStage src={photoSrc} alt={photoAlt} cards={orbitCards} />
      </div>
    </section>
  );
}
