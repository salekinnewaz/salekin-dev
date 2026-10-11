/**
 * 09-header-nav.mobile.spec.ts
 *
 * Mobile-specific header behaviour. Runs under the `mobile`
 * project (iPhone 14, 390x844). The desktop suite does NOT run
 * these because the drawer is mobile-only.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { MobileDrawerPage } from './pages/MobileDrawerPage';

test.describe('Header nav (mobile)', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Header nav (mobile)' }));

  test('hamburger is visible and the drawer is closed by default', async ({
    page,
  }) => {
    const drawer = new MobileDrawerPage(page);
    await drawer.goto();
    await drawer.expectHamburgerVisibleAndDrawerClosed();
  });

  test('hamburger opens the drawer, ESC closes it', async ({ page }) => {
    const drawer = new MobileDrawerPage(page);
    await drawer.goto();
    // The hamburger button's aria-label flips between "Open menu"
    // and "Close menu" depending on state. The Page Object locates
    // it by its stable class + aria-controls attribute so the
    // locator survives the re-render.
    await drawer.expectHamburgerLabelSaysOpen();
    await drawer.open();
    await drawer.closeViaEsc();
  });

  test('scrim click closes the drawer', async ({ page }) => {
    const drawer = new MobileDrawerPage(page);
    await drawer.goto();
    await drawer.open();
    await drawer.closeViaScrim();
  });
});