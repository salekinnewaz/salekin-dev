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
});

describe('ThemeToggle', () => {
  it('renders a main button that toggles the resolved theme', () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /theme: dark/i });
    fireEvent.click(btn);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles light → dark on the second click', () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /theme: light/i });
    fireEvent.click(btn);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles from system mode to a concrete choice', () => {
    localStorage.setItem('theme', 'system');
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /theme:/i });
    fireEvent.click(btn);
    // A click on the main icon should resolve to a concrete light/dark.
    expect(['light', 'dark']).toContain(localStorage.getItem('theme'));
  });

  it('renders a separate menu button that opens the picker', () => {
    render(<ThemeToggle />);
    const menuBtn = screen.getByRole('button', { name: /theme options/i });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /theme/i })).toBeInTheDocument();
  });

  it('renders three choices inside the menu when open', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /theme options/i }));
    for (const label of ['Light', 'Dark', 'System']) {
      expect(screen.getByRole('menuitemradio', { name: label })).toBeInTheDocument();
    }
  });

  it('picking a choice writes to localStorage and updates data-theme', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /theme options/i }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Light' }));
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('marks the currently chosen option as active in the menu', () => {
    localStorage.setItem('theme', 'system');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /theme options/i }));
    const sys = screen.getByRole('menuitemradio', { name: 'System' });
    expect(sys).toHaveAttribute('aria-checked', 'true');
  });

  it('closes the menu when the menu button is clicked again', () => {
    render(<ThemeToggle />);
    const menuBtn = screen.getByRole('button', { name: /theme options/i });
    fireEvent.click(menuBtn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(menuBtn);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when Escape is pressed', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /theme options/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
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
