'use client';

import { useEffect, useState } from 'react';

type Props = {
  building: string;
  learning: string;
  reading: string;
};

/**
 * The "Currently" trio — three glass cards showing what the dev is
 * shipping / learning / reading right now. The first card ticks
 * a live UTC+6 clock so the section visibly updates while you
 * sit on the page. All three labels are mono so they read as
 * instrumentation.
 */
export function NowWidget({ building, learning, reading }: Props) {
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    const fmt = () => {
      try {
        // Dhaka is UTC+6 — fixed offset, no DST
        const d = new Date();
        const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
        const dhaka = new Date(utcMs + 6 * 3_600_000);
        const hh = String(dhaka.getHours()).padStart(2, '0');
        const mm = String(dhaka.getMinutes()).padStart(2, '0');
        const ss = String(dhaka.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      } catch {
        return '';
      }
    };
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const cards: { label: string; value: string; live?: boolean }[] = [
    { label: 'now_building', value: building },
    { label: 'now_learning', value: learning },
    { label: 'now_reading', value: reading },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 reveal-stagger">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="glass-card glass-card-hover relative flex flex-col gap-2 overflow-hidden p-4"
        >
          {/* Top-right live clock for the first card only — gives the
              whole trio a subtle "this page is alive" signal. */}
          {i === 0 ? (
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 font-mono text-[10px] tabular-nums text-muted"
            >
              {now || '--:--:--'} <span className="text-accent">UTC+6</span>
            </span>
          ) : null}
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            <span className="text-accent-2">$</span> {c.label}
          </span>
          <p className="pr-12 text-sm leading-relaxed text-fg-2 text-pretty">
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
