'use client';

import { useEffect, useRef } from 'react';
import { HeroOrbit, type OrbitCard } from './HeroOrbit';
import { HeroTerminal } from './HeroTerminal';

type Props = {
  src: string;
  alt: string;
  cards: OrbitCard[];
};

const PARALLAX_RANGE_PX = 600;
const PARALLAX_HEADLINE_PX = 24;
const PARALLAX_AVATAR_PX = 32;

/**
 * Right column of the Hero. Pixel-accurate to the v3 brief:
 *
 *   - Composes the orbit (photo + 4 floating info cards) above the
 *     terminal, both right-aligned to a ~50% column.
 *   - One subtle scroll-driven parallax on the headline and the
 *     orbit (24px / 32px over 600px). The 3D tilt effect from the
 *     previous build is removed — the brief calls for a static
 *     composition.
 *   - Photo defaults to 280px (matches the brief). Falls back to a
 *     smaller photo on narrow viewports.
 *   - All animations are CSS-only; the JS just reads scrollY and
 *     writes inline `transform` values. No layout measurements.
 */
export function HeroStage({ src, alt, cards }: Props) {
  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    const head = document.querySelector<HTMLElement>('[data-hero-headline]');
    if (!head) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, PARALLAX_RANGE_PX);
        const t = y / PARALLAX_RANGE_PX; // 0 → 1
        head.style.transform = `translateY(${-t * PARALLAX_HEADLINE_PX}px)`;
        if (avatarRef.current) {
          avatarRef.current.style.transform = `translateY(${
            t * PARALLAX_AVATAR_PX
          }px)`;
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 lg:items-end">
      {/* Desktop / tablet — full orbit with 4 anchored cards. */}
      <div
        ref={avatarRef}
        className="hidden will-change-transform sm:block"
        style={{ transform: 'translateY(0)' }}
      >
        <HeroOrbit src={src} alt={alt} cards={cards} photoSize={280} />
      </div>
      {/* On phones the orbit collapses to a stacked layout; the
          smaller photo is rendered by HeroOrbit itself. */}
      <div className="block sm:hidden">
        <HeroOrbit src={src} alt={alt} cards={cards} photoSize={200} />
      </div>
      <div className="hidden w-full max-w-md sm:block">
        <HeroTerminal />
      </div>
    </div>
  );
}
