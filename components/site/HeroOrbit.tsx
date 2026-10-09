import { focusIcon, type FocusIconId } from '@/lib/icons';
import { ProfilePhoto } from './ProfilePhoto';

export type OrbitCardPosition = 'tl' | 'tr' | 'bl' | 'br';

export type OrbitCard = {
  /** Stable id — also used for the React key and the ARIA label. */
  id: string;
  icon: FocusIconId;
  title: string;
  /** One-line sub-label under the title (e.g. "E2E Automation"). */
  detail: string;
  /** Corner of the photo the card anchors to. */
  position: OrbitCardPosition;
  /** Optional 0..1 — when present, renders a thin gradient bar at the
   *  bottom of the card. */
  progress?: number;
  /** Delay (ms) for the `float-soft` bob — used to desync the cards
   *  so they don't all move in lock-step. */
  bobDelay: number;
};

type HeroOrbitProps = {
  cards: OrbitCard[];
  /** Photo diameter in px. Defaults to 260. */
  photoSize?: number;
  src: string;
  alt: string;
};

/**
 * HeroOrbit — the photo + 4 overlapping capability cards at the top
 * of the hero's right column.
 *
 * Composes:
 *   - A large circular `ProfilePhoto` centered in a vertical-padded
 *     wrapper (the .hero-orbit element, declared in app/globals.css).
 *     The wrapper has no aspect-ratio — its size is determined by the
 *     photo + the four cards' overlap.
 *   - 4 floating info cards (Playwright, API Testing, AI-Driven QA,
 *     CI/CD) absolutely positioned at the four corners, overlapping
 *     the photo's outer edge so they read as "markings" on the
 *     photo's rim.
 *   - Each card bobs gently via `float-soft` with a desynced
 *     `animation-delay` (driven by the per-card `bobDelay`).
 *
 * The 4 cards are `z-index: 3` so they sit above the photo's gradient
 * halo (which is rendered behind the photo by `ProfilePhoto` itself).
 * The decorative orbit rings + floating orbs that sit behind the photo
 * live in the parent (`.hero-orbit-stage`, declared in
 * `app/globals.css`).
 *
 * On screens < 1024px the orbit collapses: photo on top, 2×2 card grid
 * below — the absolute positioning is reset to `position: static` and
 * the wrapper becomes a CSS grid.
 */
export function HeroOrbit({
  cards,
  photoSize = 260,
  src,
  alt,
}: HeroOrbitProps) {
  return (
    <div
      className="hero-orbit"
      role="group"
      aria-label="Focus areas — QA stack at a glance"
    >
      <div className="hero-orbit__photo">
        <ProfilePhoto src={src} alt={alt} size={photoSize} />
      </div>
      {cards.map((card) => {
        const Icon = focusIcon(card.icon);
        const posClass = `hero-orbit__card--${card.position}`;
        return (
          <div
            key={card.id}
            className={`hero-orbit__card ${posClass} float-soft`}
            data-icon={card.icon}
            style={{ animationDelay: `${card.bobDelay}ms` }}
            role="group"
            aria-label={`${card.title} — ${card.detail}`}
          >
            <span className="hero-orbit__icon" aria-hidden="true">
              <Icon />
            </span>
            <span className="hero-orbit__copy">
              <span className="hero-orbit__title">{card.title}</span>
              <span className="hero-orbit__detail">{card.detail}</span>
            </span>
            {typeof card.progress === 'number' ? (
              <span
                className="hero-orbit__bar"
                aria-hidden="true"
                title={`${Math.round(card.progress * 100)}%`}
              >
                <span style={{ width: `${card.progress * 100}%` }} />
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
