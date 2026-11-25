'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Theme engine for the v2 design system.
 *
 * Contract (Phase 1 of the refactor spec):
 *   - Toggles the `dark` class on `<html>`. The class — not a
 *     `data-theme` attribute — is the source of truth, so Tailwind's
 *     `dark:` variants work normally.
 *   - Persists the preference in `localStorage` under
 *     `salekin-dev-theme`.
 *   - Dark is the default when nothing is stored.
 *
 * The class is also applied by a tiny inline boot script in the root
 * layout before first paint (see `app/layout.tsx`), so there is no
 * flash of the wrong theme on load. This provider picks up from
 * whatever the boot script already applied.
 */

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'salekin-dev-theme';

type ThemeContextValue = {
  /** The currently applied theme. */
  theme: Theme;
  /** Flip between light and dark. */
  toggleTheme: () => void;
  /** Apply a specific theme. */
  setTheme: (theme: Theme) => void;
  /** True once the component has mounted on the client. */
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Read the stored preference. Falls back to dark. */
function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Private mode / disabled storage — fall through to the default.
  }
  return 'dark';
}

/** Read the theme currently applied to the document. */
function readAppliedTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Apply the theme to the document and persist it. */
function applyTheme(theme: Theme, persist: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  // Keep the legacy attribute in sync so any CSS still keyed on
  // `[data-theme='dark']` keeps working.
  root.setAttribute('data-theme', theme);
  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore — quota or private mode.
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Adopt whatever the boot script applied, then listen for the case
  // where another tab changes the theme.
  useEffect(() => {
    setThemeState(readAppliedTheme());
    setMounted(true);

    function onStorage(e: StorageEvent) {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = e.newValue === 'light' ? 'light' : 'dark';
      applyTheme(next, false);
      setThemeState(next);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next, true);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme, mounted }),
    [theme, toggleTheme, setTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Read the current theme and toggle it. Safe to call from a component
 * that is not inside a `ThemeProvider` — it falls back to toggling the
 * class directly on the document, so a stray consumer can never crash
 * the tree.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  const [fallbackTheme, setFallbackTheme] = useState<Theme>('dark');
  const [fallbackMounted, setFallbackMounted] = useState(false);

  useEffect(() => {
    if (ctx) return;
    setFallbackTheme(readAppliedTheme());
    setFallbackMounted(true);
  }, [ctx]);

  if (ctx) return ctx;

  return {
    theme: fallbackTheme,
    mounted: fallbackMounted,
    setTheme: (next: Theme) => {
      applyTheme(next, true);
      setFallbackTheme(next);
    },
    toggleTheme: () => {
      setFallbackTheme((prev) => {
        const next: Theme = prev === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
        return next;
      });
    },
  };
}
