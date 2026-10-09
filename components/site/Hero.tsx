import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroStage } from './HeroStage';
import { FocusChip } from './FocusChip';
import type { FocusIconId } from '@/lib/icons';

type HeroProps = {
  identity: SiteIdentity;
};

type FocusArea = {
  id: string;
  icon: FocusIconId;
  label: string;
};

/**
 * Hero — first fold. Two-column grid inside the main container:
 *
 *   LEFT (~50%):
 *     • Eyebrow: `ISTQB® CERTIFIED · OPEN TO INTERESTING WORK`.
 *     • H1: `Salekin` (white) + `Newaz` (purple→cyan gradient) on
 *       one line at desktop. The data is `Md Salekin Newaz`; the
 *       `Md` honorific is intentionally omitted.
 *     • `SENIOR SOFTWARE QA ENGINEER` (accent, mono, uppercase).
 *     • `PLAYWRIGHT · AI-DRIVEN QA · QUALITY ENGINEERING`.
 *     • Tagline + 2 CTAs (gradient + outline).
 *     • FOCUS row: 4 icon chips + a `FOCUS` label.
 *     • Status line: `● SENIOR SOFTWARE QA ENGINEER @ BRAIN
 *       STATION 23 | Dhaka, Bangladesh`.
 *
 *   RIGHT (~50%):
 *     • The static `data/Neon QA Portfolio Hero Section.png`
 *       graphic — the finished composition containing the
 *       portrait, gradient ring, and four capability cards. It
 *       is served from `/images/hero-composition.png`. A subtle
 *       scroll parallax (≤ 32px over 600px) is preserved.
 *
 * The 4 focus areas in `focusAreas` drive only the left FOCUS
 * chip row. The right column's cards are baked into the static
 * image and no longer rendered at runtime.
 */
export function Hero({ identity }: HeroProps) {
  const title = identity.siteTitle || 'Md Salekin Newaz';
  const tagline =
    identity.siteTagline ||
    'Building quality infrastructure that enables engineering teams to release with confidence.';
  const location = identity.contactLocation?.trim();

  // Strip the honorific "Md" prefix from the data so the gradient
  // sits cleanly on the last name only. Fallback to the full title
  // if the data is unexpected.
  const nameParts = title.replace(/^Md\.?\s+/i, '').trim().split(/\s+/);
  const firstName = nameParts[0] ?? title;
  const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

  // The 4 focus areas. Single source of truth for the FOCUS chip
  // row on the left. The right column's cards are baked into the
  // static image (data/Neon QA Portfolio Hero Section.png) so this
  // list no longer needs detail/position/progress/bobDelay fields.
  const focusAreas: readonly FocusArea[] = [
    { id: 'playwright', icon: 'playwright', label: 'Playwright' },
    { id: 'api', icon: 'api', label: 'API Testing' },
    { id: 'ai', icon: 'ai', label: 'AI-Driven QA' },
    { id: 'cicd', icon: 'cicd', label: 'CI/CD' },
  ] as const;

  const chipAreas = focusAreas.map(({ icon, label }) => ({ icon, label }));

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative pb-20 pt-14 sm:pt-20 lg:pt-24"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-x-10 xl:gap-x-12">
        {/* ─── LEFT column — copy + CTAs ─── */}
        <div className="hero-left flex flex-col gap-6">
          <span
            className="eyebrow eyebrow--muted hero-stagger"
            style={{ animationDelay: '0ms' }}
          >
            ISTQB® Certified · Open to Interesting Work
          </span>

          <h1
            className="heading-display whitespace-nowrap text-[clamp(2.75rem,6.2vw,6rem)] leading-[1.02] tracking-tight hero-stagger"
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
            {tagline}
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
            className="hero-focus flex flex-wrap items-center gap-2 hero-stagger"
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

        {/* ─── RIGHT column — static hero composition ───
            The live orbit/terminal composition was replaced with the
            finished static graphic per the latest brief. The image
            already contains the photo + 4 capability cards in the
            correct positions; no runtime composition is needed. */}
        <HeroStage
          src="/images/hero-composition.png"
          alt="Profile photo surrounded by four QA capability cards: Playwright, AI-Driven QA, API Testing, and CI/CD."
        />
      </div>
    </section>
  );
}
