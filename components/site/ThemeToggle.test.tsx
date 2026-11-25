// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { THEME_STORAGE_KEY } from './ThemeProvider';

// jsdom in this project doesn't expose `window.localStorage` by default.
const memStore = new Map<string, string>();
beforeEach(() => {
  memStore.clear();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => (memStore.has(k) ? memStore.get(k)! : null),
      setItem: (k: string, v: string) => memStore.set(k, String(v)),
      removeItem: (k: string) => memStore.delete(k),
      clear: () => memStore.clear(),
      key: (i: number) => Array.from(memStore.keys())[i] ?? null,
      get length() {
        return memStore.size;
      },
    },
  });
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('dark', 'light');
});

describe('ThemeToggle', () => {
  function click(el: HTMLElement) {
    act(() => {
      fireEvent.click(el);
    });
  }

  function renderAndFlush(ui: React.ReactElement) {
    let result: ReturnType<typeof render> | undefined;
    act(() => {
      result = render(ui);
    });
    return result!;
  }

  it('renders a single button that switches dark → light', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    document.documentElement.classList.add('dark');
    renderAndFlush(<ThemeToggle />);

    const btn = screen.getByRole('button', { name: /theme: dark/i });
    click(btn);

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('switches light → dark on the second click', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    document.documentElement.classList.add('light');
    renderAndFlush(<ThemeToggle />);

    const btn = screen.getByRole('button', { name: /theme: light/i });
    click(btn);

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists the preference across a remount', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    document.documentElement.classList.add('dark');
    const first = renderAndFlush(<ThemeToggle />);
    click(screen.getByRole('button', { name: /theme: dark/i }));
    first.unmount();

    // A fresh mount should pick the stored preference back up.
    renderAndFlush(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /theme: light/i }),
    ).toBeInTheDocument();
  });

  it('exposes exactly one control — no separate system picker', () => {
    renderAndFlush(<ThemeToggle />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument();
  });

  it('does not throw when matchMedia is unavailable', () => {
    const original = window.matchMedia;
    // @ts-expect-error - intentionally removing for this test
    delete window.matchMedia;
    try {
      expect(() => render(<ThemeToggle />)).not.toThrow();
    } finally {
      window.matchMedia = original;
    }
  });
});
