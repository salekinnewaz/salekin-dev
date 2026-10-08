'use client';

import { useEffect, useState } from 'react';

type TocItem = { id: string; text: string };

type Props = {
  items: TocItem[];
};

/**
 * Client-side scroll-spy for the project TOC. Tracks the active
 * heading and updates the highlighted link. Falls back to the first
 * item when no heading is in view.
 */
export function ProjectTocClient({ items }: Props) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const onScroll = () => {
      // The active heading is the last one whose top is above ~30% of
      // the viewport. This makes the highlight snap to the section the
      // user is reading.
      const marker = window.innerHeight * 0.3;
      let current = headings[0]?.id ?? '';
      for (const h of headings) {
        if (h.getBoundingClientRect().top - marker < 0) {
          current = h.id;
        } else {
          break;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  return (
    <nav aria-label="Sections" className="flex flex-col gap-1 border-l border-border pl-3">
      {items.map((item, i) => {
        const isActive = item.id === active;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`group relative -ml-3 inline-flex items-center gap-2 rounded-r-md py-1 pl-3 pr-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
              isActive
                ? 'text-accent'
                : 'text-muted hover:text-fg-2'
            }`}
            aria-current={isActive ? 'location' : undefined}
          >
            <span
              aria-hidden="true"
              className={`absolute -left-px top-1/2 h-3 w-px -translate-y-1/2 transition-colors ${
                isActive ? 'bg-accent' : 'bg-transparent'
              }`}
            />
            <span className="text-muted/60">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="truncate">{item.text}</span>
          </a>
        );
      })}
    </nav>
  );
}
