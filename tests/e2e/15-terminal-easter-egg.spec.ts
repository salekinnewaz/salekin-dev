/**
 * 15-terminal-easter-egg.spec.ts
 *
 * The site ships a hidden TerminalEasterEgg overlay toggled by
 * Cmd+K / Ctrl+K. Pressing it on any non-form page opens the
 * overlay; Escape closes it.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';

test.describe('TerminalEasterEgg', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Terminal easter egg' }));

  test('Ctrl+K opens the overlay', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    // Wait for the client-side TerminalEasterEgg to mount: it lives
    // at the root of the layout and registers a window keydown
    // listener. On CI the heavy home page (hero terminal, orbit
    // rings, lazy chunks) can take 1-2s to hydrate, so we wait
    // for the listener to be live by polling for the effect.
    await page.waitForFunction(
      () => {
        // The component attaches a listener; we approximate "is
        // mounted" by waiting for React to have produced the
        // first effect — which means React has hydrated. We use
        // a sentinel: the page has had a few ticks since load.
        return document.readyState === 'complete';
      },
      { timeout: 10_000 },
    );
    // The component reads (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'.
    // We dispatch directly to be sure the key reaches the window listener.
    await page.evaluate(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    // The component renders <div role="dialog" aria-label="Interactive shell">.
    const dialog = page.getByRole('dialog', { name: /interactive shell/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
  });

  test('Escape closes the overlay', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForFunction(() => document.readyState === 'complete', {
      timeout: 10_000,
    });
    await page.evaluate(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    const dialog = page.getByRole('dialog', { name: /interactive shell/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    // The Escape listener is bound inside a useEffect that depends
    // on `open`, so wait one tick for the effect to fire. Then
    // dispatch Escape the same way we opened — directly to window
    // so we don't depend on the focused element.
    await page.waitForTimeout(100);
    await page.evaluate(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  });
});
