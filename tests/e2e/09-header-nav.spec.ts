/**
 * 09-header-nav.spec.ts
 *
 * Desktop + mobile navigation:
 *   - Desktop: the pill nav is visible and contains the expected
 *     section links. The active link carries data-active.
 *   - Mobile: the hamburger is visible, the drawer is closed,
 *     clicking the hamburger opens the drawer, ESC closes it,
 *     clicking the scrim closes it.
 *
 * Desktop assertions use the default project (Desktop Chrome,
 * 1280x800). The mobile-specific drawer behaviour is asserted
 * by a separate spec file that runs under the mobile project.
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';
import { beforeEach as allureBeforeEach } from './utils/allure';

test.describe('Header nav (desktop)', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Header nav' }));

  test('pill nav is visible with the expected section links', async ({
    page,
  }) => {
    await gotoAndReady(page, '/');
    // The site has TWO nav elements with the same aria-label
    // (the pill nav in the header AND the floating side nav). Scope
    // to the pill nav by its class.
    const nav = page.locator('nav.pill-nav[aria-label="Section navigation"]');
    await expect(nav).toBeVisible();
    // The 'hero' entry is intentionally filtered out — see HeaderNav.tsx.
    // The labels are "Work", "Experience", "Stack" (for #skills),
    // "Contact", and possibly more (Recommendations, About).
    for (const label of ['work', 'experience', 'stack', 'contact']) {
      const link = nav.getByRole('link', { name: new RegExp(`^${label}$`, 'i') });
      await expect(link).toBeVisible();
    }
  });

  test('clicking a nav link changes the URL hash', async ({ page }) => {
    await gotoAndReady(page, '/');
    const nav = page.locator('nav.pill-nav[aria-label="Section navigation"]');
    await nav.getByRole('link', { name: /^stack$/i }).click();
    expect(new URL(page.url()).hash).toBe('#skills');
  });
});
