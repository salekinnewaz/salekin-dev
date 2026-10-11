/**
 * 15-terminal-easter-egg.spec.ts
 *
 * The site ships a hidden TerminalEasterEgg overlay toggled by
 * Cmd+K / Ctrl+K. Pressing it on any non-form page opens the
 * overlay; Escape closes it.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { TerminalEasterEggPage } from './pages/TerminalEasterEggPage';

test.describe('TerminalEasterEgg', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Terminal easter egg' }));

  test('Ctrl+K opens the overlay', async ({ page }) => {
    const egg = new TerminalEasterEggPage(page);
    await egg.goto();
    // The component reads (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'.
    // We dispatch directly to be sure the key reaches the window listener.
    await egg.openViaCtrlK();
    await egg.expectDialogVisible();
  });

  test('Escape closes the overlay', async ({ page }) => {
    const egg = new TerminalEasterEggPage(page);
    await egg.goto();
    await egg.openViaCtrlK();
    await egg.expectDialogVisible();
    await egg.closeViaEsc();
    await egg.expectDialogHidden();
  });
});