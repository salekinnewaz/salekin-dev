import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroStage } from './HeroStage';

type HeroProps = {
  identity: SiteIdentity;
};

/**
 * First fold.
 *
 * Calmer than the previous iteration — fewer competing elements,
 * less terminal copy, and large typography that breathes.
 *
 *   - Eyebrow status row
 *   - Large static-gradient display heading
 *   - 1-line role strap
 *   - Single tagline
 *   - 2 CTAs (View Work, Download Resume)
 *   - "Currently building at …" status line below the CTAs
 *   - HeroStage on the right: avatar + small terminal
 *
 * Terminal styling is contained to a single `$` glyph on the eyebrow
 * — not spread across every line.
 */
export function Hero({ identity }: HeroProps) {
  const title = identity.siteTitle || 'Salekin Newaz';
  const tagline =
    identity.siteTagline ||
    'Building reliable digital products with modern web technologies.';
  const initials = identity.siteInitials || 'SN';

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
            open to opportunities
          </span>

          <h1
            className="heading-display heading-gradient text-5xl sm:text-6xl lg:text-7xl xl:text-[6rem]"
            data-hero-headline
          >
            <span className="block">{title.split(' ')[0]}</span>
            {title.split(' ').slice(1).length > 0 ? (
              <span className="block">{title.split(' ').slice(1).join(' ')}</span>
            ) : null}
          </h1>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm uppercase tracking-widest text-fg-2 sm:text-base">
            <span className="text-accent">Software Engineer</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>Full-Stack</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span>TypeScript · Next.js</span>
          </p>

          <p className="max-w-2xl text-lg leading-relaxed text-fg-2 text-pretty sm:text-xl">
            {tagline}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link href="/#work" className="btn-primary magnetic">
              view work
              <span aria-hidden="true">↓</span>
            </Link>
            <a href="/cv-download" className="btn-outline magnetic">
              download resume
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span>
              <span className="text-fg-2">Currently building at</span>{' '}
              Braintree Technologies
            </span>
          </p>
        </div>

        <HeroStage initials={initials} />
      </div>
    </section>
  );
}
