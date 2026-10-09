'use client';

import { useEffect, useRef } from 'react';

type Props = {
  /** Public path of the static hero composition. */
  src: string;
  alt: string;
  /** Optional parallax on the image. The original orbit/terminal
   *  composition is no longer used — the brief now wants the
   *  finished graphic rendered as a single static image. */
  enableParallax?: boolean;
};

/**
 * Right column of the Hero. Renders the *static* hero composition
 * (portrait + 4 capability cards) as a single image. The previous
 * live orbit + terminal component was replaced because the brief now
 * ships a finished graphic that already encodes the composition.
 *
 * Optional subtle parallax on scroll (≤32px over 600px) is preserved
 * for the same "polish" feeling the live version had, but it is
 * disabled by default and respects `prefers-reduced-motion`.
 */
export function HeroStage({
  src,
  alt,
  enableParallax = true,
}: Props) {
  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enableParallax) return;
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, 600);
        const t = y / 600; // 0 → 1
        if (avatarRef.current) {
          avatarRef.current.style.transform = `translateY(${
            t * 32
          }px)`;
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enableParallax]);

  return (
    <div className="hero-static">
      <div
        ref={avatarRef}
        className="hero-static__frame will-change-transform"
        style={{ transform: 'translateY(0)' }}
      >
        <img
          src={src}
          alt={alt}
          className="hero-static__img"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
