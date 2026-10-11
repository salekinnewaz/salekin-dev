/**
 * 09-header-nav.mobile.spec.ts
 *
 * Mobile-specific header behaviour. Runs under the `mobile`
 * project (iPhone 14, 390x844). The desktop suite does NOT run
 * these because the drawer is mobile-only.
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';

test.describe('Header nav (mobile)', () => {
  test('hamburger is visible and the drawer is closed by default', async ({
    page,
  }) => {
    await gotoAndReady(page, '/');
    const hamburger = page.locator('button.hamburger[aria-controls="mobile-drawer"]');
    await expect(hamburger).toBeVisible();
    // The drawer element exists but is hidden (no data-open).
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toBeAttached();
    await expect(drawer).not.toHaveAttribute('data-open', 'true');
  });

  test('hamburger opens the drawer, ESC closes it', async ({ page }) => {
    await gotoAndReady(page, '/');
    // The hamburger button's aria-label flips between "Open menu"
    // and "Close menu" depending on state. Grab it by its stable
    // class + aria-controls attribute so the locator survives the
    // re-render.
    const hamburger = page.locator('button.hamburger[aria-controls="mobile-drawer"]');
    await expect(hamburger).toHaveAttribute('aria-label', /open menu/i);
    await hamburger.click();
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toHaveAttribute('data-open', 'true');
    // The aria-label on the hamburger now reads "Close menu".
    await expect(hamburger).toHaveAttribute('aria-label', /close menu/i);
    // ESC closes it.
    await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveAttribute('data-open', 'true');
  });

  test('scrim click closes the drawer', async ({ page }) => {
    await gotoAndReady(page, '/');
    await page.locator('button.hamburger[aria-controls="mobile-drawer"]').click();
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toHaveAttribute('data-open', 'true');
    // The scrim is a sibling of the panel inside the drawer.
    await page.locator('#mobile-drawer .drawer__scrim').click();
    await expect(drawer).not.toHaveAttribute('data-open', 'true');
  });
});
