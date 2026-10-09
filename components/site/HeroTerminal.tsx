'use client';

import { useEffect, useRef, useState } from 'react';

type Line = { kind: 'cmd' | 'out'; text: string; tone?: 'muted' | 'accent' | 'accent-2' };

const SCRIPT: Line[] = [
  { kind: 'cmd', text: '$ whoami' },
  { kind: 'out', text: 'salekin', tone: 'accent' },
  { kind: 'cmd', text: '$ focus' },
  {
    kind: 'out',
    text: 'Quality Engineering | Playwright | AI',
    tone: 'accent-2',
  },
  { kind: 'cmd', text: '$ stack --top' },
  {
    kind: 'out',
    text: 'next · react · typescript · postgres · tailwind',
    tone: 'muted',
  },
  { kind: 'cmd', text: '$ availability' },
  { kind: 'out', text: 'open · UTC+6', tone: 'accent-2' },
  { kind: 'cmd', text: '$ cat motto.txt' },
  { kind: 'out', text: 'ship small, ship often.', tone: 'muted' },
];

const TYPE_MS = 28;
const LINE_PAUSE_MS = 380;
const LOOP_PAUSE_MS = 4200;

/**
 * Tiny terminal in the hero. Steps through a fixed script with a
 * blinking caret. Pauses on hover so the user can read a line.
 * Respects `prefers-reduced-motion`: skips the typing animation and
 * reveals the full transcript at once.
 */
export function HeroTerminal() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Reset / advance through the script
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setLineIdx(SCRIPT.length);
      return;
    }

    if (hovered) return;

    const current = SCRIPT[lineIdx];
    if (!current) {
      // End of script → wait, then loop
      const id = setTimeout(() => {
        setLineIdx(0);
        setCharIdx(0);
      }, LOOP_PAUSE_MS);
      return () => clearTimeout(id);
    }

    if (current.kind === 'cmd') {
      if (charIdx < current.text.length) {
        const id = setTimeout(() => setCharIdx((c) => c + 1), TYPE_MS);
        return () => clearTimeout(id);
      }
      // Cmd fully typed → pause then move to next line
      const id = setTimeout(() => {
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, LINE_PAUSE_MS);
      return () => clearTimeout(id);
    }

    // Output line — just pause then move on
    const id = setTimeout(() => {
      setLineIdx((i) => i + 1);
      setCharIdx(0);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(id);
  }, [lineIdx, charIdx, hovered]);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="terminal-card relative w-full max-w-md overflow-hidden p-0"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          ~/salekin — zsh
        </span>
        <span className="w-10" />
      </div>

      {/* Body */}
      <div className="px-4 py-4 font-mono text-[13px] leading-relaxed">
        {SCRIPT.slice(0, lineIdx).map((line, i) => (
          <LineView key={i} line={line} cursor={false} />
        ))}
        {lineIdx < SCRIPT.length ? (
          <LineView
            line={{ ...SCRIPT[lineIdx]!, text: SCRIPT[lineIdx]!.text.slice(0, charIdx) }}
            cursor
          />
        ) : null}
      </div>
    </div>
  );
}

function LineView({ line, cursor }: { line: Line; cursor: boolean }) {
  const tone =
    line.tone === 'accent'
      ? 'text-accent'
      : line.tone === 'accent-2'
        ? 'text-accent-2'
        : 'text-muted';
  if (line.kind === 'cmd') {
    return (
      <div className="text-fg">
        {line.text}
        {cursor ? <Caret /> : null}
      </div>
    );
  }
  return (
    <div className={tone}>
      {line.text}
      {cursor ? <Caret /> : null}
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[1px] bg-accent align-baseline"
      style={{ animation: 'caret-blink 1.05s steps(2) infinite' }}
    />
  );
}
