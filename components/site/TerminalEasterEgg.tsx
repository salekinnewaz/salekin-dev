'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { runCommand, type CommandResult } from '@/lib/terminal/commands';

type Line = { kind: 'in' | 'out' | 'sys'; text: string };

/**
 * Terminal easter-egg.
 *
 * - Trigger: `Cmd+K` (mac) or `Ctrl+K` (everyone else), or a click on
 *   the floating `$` button in the bottom-right corner.
 * - Closes on Escape, on outside click, or on clicking the close button.
 * - 6 commands, plus `help`, `whoami`, `clear`, and `theme`.
 * - Honors `prefers-reduced-motion`: no animation, just a hard show/hide.
 * - Does not steal focus from form inputs — if the user is typing in
 *   a field, the shortcut is a no-op.
 */
export function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    {
      kind: 'sys',
      text: 'salekin.dev shell · type `help` for commands · esc to close',
    },
  ]);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Keep the scroller pinned to the bottom when new lines arrive.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  // Focus the input whenever the overlay opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Global keybindings: ⌘K / Ctrl+K to toggle, Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't steal the shortcut while the user is typing somewhere
      // — text inputs, textareas, and content-editable fields.
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          t.isContentEditable
        ) {
          return;
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function execute(raw: string) {
    const result: CommandResult = runCommand(raw);
    if (result.output === '__CLEAR__') {
      setLines([]);
      return;
    }
    setLines((prev) => [
      ...prev,
      { kind: 'in', text: raw },
      ...(result.output
        ? [{ kind: 'out' as const, text: result.output }]
        : []),
    ]);
    if (result.effect) {
      const eff = result.effect;
      if (eff.kind === 'scroll') {
        const el = document.getElementById(eff.target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setOpen(false);
      } else if (eff.kind === 'open') {
        if (eff.href.startsWith('http')) {
          window.open(eff.href, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = eff.href;
        }
        setOpen(false);
      } else if (eff.kind === 'toggle-theme') {
        const root = document.documentElement;
        const current = root.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try {
          localStorage.setItem('theme', next);
        } catch {
          // ignore — private mode, quota, etc.
        }
      }
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    execute(draft);
    setDraft('');
  }

  return (
    <>
      {/* Floating trigger — bottom-right. Hidden on mobile (the ⌘K
          hint in the hero is the discoverable affordance there). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open interactive shell (⌘K)"
        className="terminal-trigger fixed bottom-5 right-5 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-card font-mono text-base text-accent backdrop-blur transition-transform hover:scale-105 hover:border-accent sm:inline-flex"
      >
        <span aria-hidden="true">$</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Interactive shell"
          aria-modal="true"
          className="terminal-overlay fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] sm:pt-[18vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="terminal-overlay__scrim absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="terminal-overlay__panel relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff5f56]"
                  aria-hidden="true"
                />
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"
                  aria-hidden="true"
                />
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-[#27c93f]"
                  aria-hidden="true"
                />
                <span className="ml-2 text-accent">salekin.dev</span>
                <span aria-hidden="true">— zsh</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close shell"
                className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted hover:text-accent"
              >
                esc
              </button>
            </div>
            <div
              ref={scrollerRef}
              className="max-h-[55vh] overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === 'in'
                      ? 'text-fg'
                      : line.kind === 'out'
                        ? 'text-fg-2 whitespace-pre-wrap'
                        : 'text-muted'
                  }
                >
                  {line.kind === 'in' ? (
                    <span className="text-accent-2">$ </span>
                  ) : null}
                  {line.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-border bg-card/40 px-4 py-2.5 font-mono text-sm"
            >
              <span aria-hidden="true" className="text-accent-2">
                $
              </span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Shell input"
                placeholder="type a command — e.g. help, resume, work"
                className="w-full bg-transparent text-fg placeholder:text-muted/70 focus:outline-none"
              />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
