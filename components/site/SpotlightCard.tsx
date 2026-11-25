'use client';

import { useCallback, useRef, type ReactNode } from 'react';

/**
 * SpotlightCard — the mouse-tracking surface used by every card in a
 * bento grid.
 *
 * The component writes the pointer position into two CSS custom
 * properties on the card element (`--mouse-x`, `--mouse-y`). The
 * `.spotlight-card` rules in `globals.css` turn those into a radial
 * surface wash and a 1px border glow that follow the cursor.
 *
 * Notes:
 *   - The pointer position is stored in a ref and written directly to
 *     the DOM node rather than into React state. A state update per
 *     mousemove would re-render the whole card tree 60 times a second
 *     for no benefit — the values are only ever read by CSS.
 *   - Touch devices have no hover, so the handler is skipped there and
 *     the card renders in its neutral state.
 *   - `prefers-reduced-motion` removes the lift via CSS; the glow is
 *     harmless and stays.
 */

type SpotlightCardProps = {
  children: ReactNode;
  /** Extra classes merged onto the card element. */
  className?: string;
  /** Render as a different element (e.g. `li`, `article`). */
  as?: 'div' | 'li' | 'article' | 'section';
};

export function SpotlightCard({
  children,
  className = '',
  as: Tag = 'div',
}: SpotlightCardProps) {
  const ref = useRef<HTMLElement | null>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onPointerMove}
      className={`spotlight-card ${className}`}
    >
      {children}
    </Tag>
  );
}
