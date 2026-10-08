'use client';

import { useEffect, useRef, useState } from 'react';
import { InitialsAvatar } from './InitialsAvatar';
import { HeroTerminal } from './HeroTerminal';

type Props = {
  initials: string;
};

const PARALLAX_RANGE_PX = 600;
const PARALLAX_HEADLINE_PX = 40;
const PARALLAX_AVATAR_PX = 60;

/**
 * Right column of the Hero. Three jobs:
 *   1. Scroll-driven parallax on the headline and the avatar (h1 lifts
 *      up by 40px as the user scrolls 0–600px, avatar drifts down by
 *      60px in the same window — depth without being heavy).
 *   2. 3D tilt on the avatar (rotateX/Y based on cursor position,
 *      max 8°). Disabled on touch + reduced motion.
 *   3. Composes the avatar + animated terminal: desktop shows them
 *      side-by-side (avatar top-right, terminal below); tablet just
 *      shows the terminal; phone just shows the avatar.
 */
export function HeroStage({ initials }: Props) {
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  function onAvatarMove(e: React.MouseEvent<HTMLDivElement>) {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(hover: none)').matches) return;
    const target = e.currentTarget;
    const r = target.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    setTilt({ x: dx * 8, y: -dy * 8 });
  }
  function onAvatarLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div className="flex flex-col items-center gap-8 lg:items-end">
      <div
        ref={avatarRef}
        onMouseMove={onAvatarMove}
        onMouseLeave={onAvatarLeave}
        className="hidden will-change-transform sm:block"
        style={{
          transform: 'translateY(0)',
          transition: 'transform 200ms ease-out',
          perspective: '800px',
        }}
      >
        <div
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 220ms ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          <InitialsAvatar initials={initials} size={180} />
        </div>
      </div>
      {/* On phones, the avatar column is hidden (sm:hidden). Render a
          smaller avatar above the terminal for narrow viewports. */}
      <div className="block sm:hidden">
        <InitialsAvatar initials={initials} size={120} />
      </div>
      <div className="hidden w-full max-w-md sm:block">
        <HeroTerminal />
      </div>
    </div>
  );
}
