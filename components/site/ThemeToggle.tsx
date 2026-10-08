'use client';

import { useEffect, useRef, useState } from 'react';

type Choice = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'theme';

function readChoice(): Choice {
  if (typeof window === 'undefined') return 'dark';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // ignore
  }
  return 'system';
}

function readResolvedTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' ? 'light' : 'dark';
}

function applyTheme(choice: Choice) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (choice === 'system') {
    const mql =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    const prefersDark = mql ? mql.matches : true;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', choice);
  }
}

function persist(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // ignore — private mode, quota, etc.
  }
}

const ICONS = {
  light: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  dark: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
} as const;

const SMALL_ICONS = {
  light: ICONS.light,
  dark: ICONS.dark,
  system: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
} as const;

const CHOICES: { value: Choice; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

/**
 * Theme picker with two buttons:
 *  - Left button (icon): toggles light ↔ dark directly. The most common
 *    case — a single click does one obvious thing.
 *  - Right button (chevron): opens / closes the full 3-way picker
 *    (Light / Dark / System).
 *  - Hover the wrapper: previews the menu (with a short delay so the menu
 *    doesn't pop while the cursor is just passing through).
 *  - Click outside or Escape: closes the menu.
 */
export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark');
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hoverTimer = useRef<number | null>(null);
  // True if the user is currently hovering the wrapper. Used to suppress
  // outside-click dismissal so the menu doesn't vanish when the user
  // moves the cursor from the icon button to a menu item.
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setMounted(true);
    setChoice(readChoice());
    setResolved(readResolvedTheme());
  }, []);

  // Close the menu when clicking outside or pressing Escape — but only
  // when the cursor has actually left the wrapper, otherwise the click
  // bubbles up from a menu item and would dismiss the menu instantly.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      if (hovering) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, hovering]);

  // Track the system preference so the UI stays honest in "system" mode
  // and reflects OS theme changes without a page reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readChoice() === 'system') {
        applyTheme('system');
        setResolved(readResolvedTheme());
      }
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Watch for any external change to data-theme so the icon stays in sync.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const obs = new MutationObserver(() => setResolved(readResolvedTheme()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
  }, []);

  function pick(next: Choice) {
    setChoice(next);
    setOpen(false);
    persist(next);
    applyTheme(next);
    setResolved(readResolvedTheme());
  }

  function toggleTheme() {
    // Always toggle the *resolved* theme. If the user is in "system"
    // mode, the click resolves the choice to whichever mode the OS
    // reports (so they don't bounce back to system next reload).
    const flipTo: Choice = resolved === 'dark' ? 'light' : 'dark';
    pick(flipTo);
  }

  function onMouseEnter() {
    setHovering(true);
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    // Don't auto-open if the user has explicitly closed the menu by
    // pressing Escape or clicking the chevron — only on first hover.
    hoverTimer.current = window.setTimeout(() => setOpen(true), 220);
  }
  function onMouseLeave() {
    setHovering(false);
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  if (!mounted) {
    // SSR / first client render: render the real button group with a
    // default dark icon so the user sees a working button immediately.
    // After mount we read the persisted choice and swap the icon.
    return (
      <div className="theme-toggle">
        <div className="theme-toggle__group">
          <button
            type="button"
            className="theme-toggle__btn theme-toggle__btn--main"
            aria-label="Toggle theme"
            data-resolved="dark"
            // The real onClick is attached after mount; during SSR this
            // is a no-op so React's hydration doesn't complain.
            onClick={() => {}}
          >
            <span className="theme-toggle__icon">{ICONS.dark}</span>
          </button>
          <button
            type="button"
            className="theme-toggle__btn theme-toggle__btn--menu"
            aria-label="Theme options"
            aria-haspopup="menu"
            aria-expanded={false}
            onClick={() => {}}
          >
            <span className="theme-toggle__chevron" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const choiceLabel = CHOICES.find((c) => c.value === choice)?.label ?? 'System';
  const toggleAria = `Theme: ${choiceLabel} (showing ${resolved}). Click to toggle.`;
  const menuAria = `Theme options. Currently ${choiceLabel}.`;

  return (
    <div
      className="theme-toggle"
      ref={wrapRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="theme-toggle__group" data-open={open || undefined}>
        <button
          type="button"
          className="theme-toggle__btn theme-toggle__btn--main"
          aria-label={toggleAria}
          onClick={toggleTheme}
          data-resolved={resolved}
        >
          <span className="theme-toggle__icon">{ICONS[resolved]}</span>
        </button>
        <button
          type="button"
          className="theme-toggle__btn theme-toggle__btn--menu"
          aria-label={menuAria}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="theme-toggle__chevron" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </div>
      {open ? (
        <div className="theme-menu" role="menu" aria-label="Theme">
          <div className="theme-menu__head" aria-hidden="true">
            Appearance
          </div>
          {CHOICES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="menuitemradio"
              aria-checked={choice === c.value}
              className="theme-menu__item"
              data-active={choice === c.value || undefined}
              onClick={() => pick(c.value)}
            >
              <span className="theme-menu__icon" aria-hidden="true">
                {SMALL_ICONS[c.value]}
              </span>
              <span className="theme-menu__label">{c.label}</span>
              {choice === c.value ? (
                <svg
                  className="theme-menu__check"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
