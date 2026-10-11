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
import { beforeEach as allureBeforeEach } from './utils/allure';
import { HeaderPage } from './pages/HeaderPage';

test.describe('Header nav (desktop)', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Header nav' }));

  test('pill nav is visible with the expected section links', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    await header.goto();
    await header.expectPillNavVisibleWithLinks();
  });

  test('clicking a nav link changes the URL hash', async ({ page }) => {
    const header = new HeaderPage(page);
    await header.goto();
    // 'stack' is the label that maps to #skills in the site.
    await header.clickSectionLinkAndAssertHash('stack', '#skills');
  });
});