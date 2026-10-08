// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

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
  // ThemeToggle installs a MutationObserver on `documentElement` to
  // re-sync its resolved-theme state when the attribute changes. In the
  // browser, that callback is a microtask away from the act boundary —
  // which then fires `setState` outside an `act(...)` and produces
  // noisy "update not wrapped in act" warnings. Replace the observer
  // with a no-op so tests don't trip on their own attribute writes.
  class NoopMutationObserver {
    observe() {}
    disconnect() {}
    takeRecords(): unknown[] {
      return [];
    }
  }
  // @ts-expect-error - test stub
  globalThis.MutationObserver = NoopMutationObserver;
});

describe('ThemeToggle', () => {
  // Each `fireEvent.click` below triggers a `setState` cascade inside the
  // component (theme choice, resolved theme, menu open/close). Wrap the
  // fires in `act(...)` so React's post-click flushes complete before the
  // next assertion — otherwise we get noisy "update not wrapped in act"
  // warnings that hide real failures.
  function click(el: HTMLElement) {
    act(() => {
      fireEvent.click(el);
    });
  }
  // The component reads localStorage / data-theme in a mount effect and
  // fires three setStates from it. RTL's `render` does wrap effects in
  // act, but in this jsdom the effect also touches `document.documentElement`
  // which can re-enter the MutationObserver set up by the component
  // itself. Wrap render in `act` to drain everything before assertions.
  function renderAndFlush(ui: React.ReactElement) {
    let result: ReturnType<typeof render> | undefined;
    act(() => {
      result = render(ui);
    });
    return result!;
  }

  it('renders a main button that toggles the resolved theme', () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    renderAndFlush(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /theme: dark/i });
    click(btn);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles light → dark on the second click', () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    renderAndFlush(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /theme: light/i });
    click(btn);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles from system mode to a concrete choice', () => {
    localStorage.setItem('theme', 'system');
    document.documentElement.setAttribute('data-theme', 'dark');
    renderAndFlush(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /theme:/i });
    click(btn);
    // A click on the main icon should resolve to a concrete light/dark.
    expect(['light', 'dark']).toContain(localStorage.getItem('theme'));
  });

  it('renders a separate menu button that opens the picker', () => {
    renderAndFlush(<ThemeToggle />);
    const menuBtn = screen.getByRole('button', { name: /theme options/i });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /theme/i })).toBeInTheDocument();
  });

  it('renders three choices inside the menu when open', () => {
    renderAndFlush(<ThemeToggle />);
    click(screen.getByRole('button', { name: /theme options/i }));
    for (const label of ['Light', 'Dark', 'System']) {
      expect(screen.getByRole('menuitemradio', { name: label })).toBeInTheDocument();
    }
  });

  it('picking a choice writes to localStorage and updates data-theme', () => {
    renderAndFlush(<ThemeToggle />);
    click(screen.getByRole('button', { name: /theme options/i }));
    click(screen.getByRole('menuitemradio', { name: 'Light' }));
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('marks the currently chosen option as active in the menu', () => {
    localStorage.setItem('theme', 'system');
    renderAndFlush(<ThemeToggle />);
    click(screen.getByRole('button', { name: /theme options/i }));
    const sys = screen.getByRole('menuitemradio', { name: 'System' });
    expect(sys).toHaveAttribute('aria-checked', 'true');
  });

  it('closes the menu when the menu button is clicked again', () => {
    renderAndFlush(<ThemeToggle />);
    const menuBtn = screen.getByRole('button', { name: /theme options/i });
    click(menuBtn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    click(menuBtn);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when Escape is pressed', () => {
    renderAndFlush(<ThemeToggle />);
    click(screen.getByRole('button', { name: /theme options/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
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
