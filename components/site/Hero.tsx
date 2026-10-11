import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroOrbit, type OrbitCard } from './HeroOrbit';
import { HeroTerminal } from './HeroTerminal';
import { AvailabilityBadge } from './AvailabilityBadge';
import type { FocusIconId } from '@/lib/icons';

type HeroProps = {
  identity: SiteIdentity;
};

type FocusArea = {
  id: string;
  icon: FocusIconId;
  title: string;
  detail: string;
  position: 'tl' | 'tr' | 'bl' | 'br';
  bobDelay: number;
};

/**
 * Hero — first fold. Two-column grid inside the main container:
 *
 *   LEFT (~55%):
 *     • Single quiet eyebrow: `SENIOR SOFTWARE QA ENGINEER · OPEN TO
 *       INTERESTING WORK` (the ISTQB® certification has its own
 *       section below, no need to repeat it in the eyebrow).
 *     • H1: `Salekin` (white) + `Newaz` (purple→cyan gradient). The
 *       data is `Md Salekin Newaz`; the `Md` honorific is dropped
 *       so the gradient sits cleanly on the last name only.
 *     • One short tagline + 2 CTAs (primary + outline).
 *     • A small mono location/role line (the in-progress status
 *       lives in the Current Role section).
 *
 *   RIGHT (~45%):
 *     • A live, code-driven composition rendered by `HeroOrbit`:
 *       a circular profile photo (clipped from `/images/profile.jpg`,
 *       wrapped in a purple→cyan gradient ring) with TWO capability
 *       cards floating at the top corners. We keep the orbit
 *       minimal — Playwright + AI-Driven QA — to avoid repeating
 *       the full skill list that already lives in Core Expertise.
 *     • Below the photo, the real `HeroTerminal` component — a tiny
 *       macOS-chrome terminal window that types through a fixed
 *       script of whoami / focus / stack / availability / motto
 *       with a blinking caret.
 *     • Honours light + dark mode + reduced motion.
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

  // Two cards only — Playwright + AI-Driven QA. API Testing and
  // CI/CD are already covered in the Core Expertise section, so
  // repeating them in the orbit would be visual noise.
  const orbitCards: OrbitCard[] = [
    {
      id: 'playwright',
      icon: 'playwright',
      title: 'Playwright',
      detail: 'E2E Automation',
      position: 'tl',
      bobDelay: 0,
    },
    {
      id: 'ai',
      icon: 'ai',
      title: 'AI-Driven QA',
      detail: 'Smarter Testing',
      position: 'tr',
      bobDelay: 600,
    },
  ];

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative pb-20 pt-14 sm:pt-20 lg:pt-24"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-x-10 xl:gap-x-12">
        {/* ─── LEFT column — copy + CTAs ─── */}
        <div className="hero-left flex flex-col gap-6">
          <span
            className="availability-badge-wrap hero-stagger inline-flex items-center gap-3"
            style={{ animationDelay: '0ms' }}
          >
            <AvailabilityBadge />
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
            className="max-w-[540px] text-[1.05rem] leading-[1.65] text-fg-2 text-pretty sm:text-[1.18rem] hero-stagger"
            style={{ animationDelay: '240ms' }}
          >
            {tagline}
          </p>

          <div
            className="flex flex-wrap items-center gap-3 hero-stagger"
            style={{ animationDelay: '320ms' }}
          >
            <Link
              href="/#work"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-[0.95rem]"
            >
              Explore My Work
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

          {location ? (
            <p
              className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted hero-stagger"
              style={{ animationDelay: '420ms' }}
            >
              <span className="normal-case tracking-normal">{location}</span>
            </p>
          ) : null}
        </div>

        {/* ─── RIGHT column — portrait + terminal ───
            Top: a circular profile photo with two QA capability
            cards floating at the top corners (Playwright, AI-Driven
            QA). The bottom half hosts the real `HeroTerminal`
            component — a small macOS-chrome terminal that types
            through a fixed whoami / focus / stack / availability
            / motto script. Decorative orbit rings + floating orbs
            are intentionally omitted to keep the visual hierarchy
            focused on the portrait and CTAs. */}
        <div className="hero-orbit-wrap">
          <div className="hero-orbit-stage">
            <HeroOrbit
              cards={orbitCards}
              src="/images/profile.jpg"
              alt="Profile photo of Salekin Newaz with two capability cards: Playwright and AI-Driven QA."
              photoSize={260}
            />
          </div>
          <div className="hero-orbit-terminal">
            <HeroTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
