'use client';

import { useTheme } from './ThemeProvider';

/**
 * Light/Dark theme toggle.
 *
 * A single button that flips between the two modes. The spec calls for
 * "persistent Dark/Light theme switching" — a two-state control — so
 * there is no separate "system" option; the initial value comes from
 * the stored preference, defaulting to dark.
 *
 * The icon reflects the theme that is *currently applied*, so a reader
 * always knows what they are looking at. The accessible name states
 * both the current theme and what the click will do.
 */
export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  const isDark = theme === 'dark';

  const label = mounted
    ? `Theme: ${isDark ? 'dark' : 'light'}. Switch to ${isDark ? 'light' : 'dark'}.`
    : 'Switch theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-resolved={isDark ? 'dark' : 'light'}
      className="theme-toggle__btn theme-toggle__btn--main !h-9 !w-9 !border-[var(--color-border)] !bg-[var(--color-card)] !p-0 transition-colors hover:!border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? (
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
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
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
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}
