/**
 * AvailabilityBadge — highlighted "Open to Interesting Work" pill in the
 * hero. Replaces the static muted-eyebrow copy with an attention-grabbing
 * status badge that types its message in one character at a time, with
 * each character entering in a small "flying" (translate + fade + scale)
 * motion. Loops forever.
 *
 * Design:
 *   • Green/available dot pulsing on the left.
 *   • Static `OPEN TO` label (muted, all-caps mono).
 *   • Animated phrase `Interesting Work` whose 17 characters each animate
 *     in on their own staggered delay. The total cycle is long enough
 *     (~7s) to read the phrase, pause, then erase and restart.
 *   • A blinking caret sits at the end of the typed text.
 *
 * Implementation: pure CSS. No `useEffect`, no `useState`, no timers —
 * each `<span>` carries an inline `animationDelay`, and the global
 * `@keyframes availability-fly` (in `app/globals.css`) drives the
 * per-character fly-in. The caret uses the existing `@keyframes
 * caret-blink` already defined in the terminal styles.
 *
 * Reduced motion: the `@media (prefers-reduced-motion: reduce)` block in
 * `globals.css` disables the per-character animation and caret blink
 * and instead renders the full phrase statically with the caret
 * hidden — so the badge reads correctly but doesn't move.
 *
 * The static `OPEN TO` label and the live-region `aria-label` ensure
 * the meaning of the badge is preserved for screen readers and
 * search engines regardless of animation state.
 */
const ANIMATED_PHRASE = 'Interesting Work';

export function AvailabilityBadge() {
  const chars = Array.from(ANIMATED_PHRASE);

  return (
    <span
      className="availability-badge"
      role="status"
      aria-label="Open to interesting work"
    >
      <span className="availability-badge__dot" aria-hidden="true">
        <span className="availability-badge__dot-ping" />
        <span className="availability-badge__dot-core" />
      </span>
      <span className="availability-badge__label">Open to</span>
      <span className="availability-badge__type" aria-hidden="true">
        {chars.map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="availability-badge__char"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
        <span className="availability-badge__caret" aria-hidden="true" />
      </span>
    </span>
  );
}
