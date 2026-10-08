import Link from 'next/link';
import type { SiteIdentity } from '@/lib/queries/site';
import { HeroStage } from './HeroStage';

type HeroProps = {
  identity: SiteIdentity;
};

/**
 * First fold.
 *   - Eyebrow
 *   - Big gradient display heading (title)
 *   - Tagline + subtitle
 *   - CTA row (primary + outline)
 *   - HeroStage on the right: 3D-tilted avatar over an animated
 *     terminal. HeroStage also applies scroll-driven parallax to
 *     the headline.
 */
export function Hero({ identity }: HeroProps) {
  const title = identity.siteTitle || 'Salekin Newaz';
  const tagline = identity.siteTagline || 'Web developer building clean, fast user experiences.';
  const subtitle = identity.siteSubtitle || '';
  const initials = identity.siteInitials || 'SN';

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
            <Link href="#contact" className="btn-primary magnetic">
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
          </div>

          {identity.contactLocation ? (
            <p className="mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {identity.contactLocation}
            </p>
          ) : null}
        </div>

        <HeroStage initials={initials} />
      </div>
    </section>
  );
}