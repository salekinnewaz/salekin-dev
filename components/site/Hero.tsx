import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroStage } from './HeroStage';

type HeroProps = {
  identity: SiteIdentity;
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
 *   - Stack chips: 5 short items from brief §2
 *   - "● Senior Software QA Engineer @ Brain Station 23" status line
 *   - HeroStage on the right (initials avatar + small terminal)
 *
 * Terminal styling is contained to a single `$` glyph on the eyebrow
 * and one muted status line.
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

  // 5 stack chips from brief §2. These are the only technologies we
  // surface on the home page above the fold — the full QA stack is
  // in the Core Expertise section further down.
  const stack = [
    'Playwright',
    'JavaScript',
    'API Testing',
    'CI/CD',
    'AI',
  ] as const;

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="section-anchor relative flex min-h-[80vh] flex-col justify-center pb-16 pt-12 sm:pt-20"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-8">
          <span className="eyebrow">
            <span aria-hidden="true" className="font-mono opacity-80">$</span>
            ISTQB® Certified · open to interesting work
          </span>

          <h1
            className="heading-display heading-gradient text-5xl sm:text-6xl lg:text-7xl xl:text-[6rem]"
            data-hero-headline
          >
            <span className="block">{title.split(' ')[0]}</span>
            {title.split(' ').slice(1).length > 0 ? (
              <span className="block">
                {title.split(' ').slice(1).join(' ')}
              </span>
            ) : null}
          </h1>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm uppercase tracking-widest text-fg-2 sm:text-base">
            <span className="float-soft text-accent">Senior Software QA Engineer</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>Playwright</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>AI-Driven QA</span>
          </p>

          <p className="max-w-2xl text-lg leading-relaxed text-fg-2 text-pretty sm:text-xl">
            {/* SEO: the full name appears in the tagline so the home page
                has the name in visible on-page text (not just the H1).
                Search engines weight body text heavily for name queries. */}
            {tagline.includes(identity.siteTitle)
              ? tagline
              : `I'm ${identity.siteTitle}. ${tagline}`}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link href="/#work" className="btn-primary magnetic">
              view my work
              <span aria-hidden="true">↓</span>
            </Link>
            <a href="/cv-download" className="btn-outline magnetic">
              download resume
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <ul
            aria-label="Focus areas"
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <li className="font-mono text-xs uppercase tracking-widest text-muted">
              focus ·
            </li>
            {stack.map((s) => (
              <li key={s}>
                <span className="tag">{s}</span>
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

        <HeroStage src={photoSrc} alt={photoAlt} />
      </div>
    </section>
  );
}
