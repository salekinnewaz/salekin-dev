/**
 * 03-about.spec.ts
 *
 * Covers /about: full name, "At a glance" dl, social links, and
 * the Download CV CTA that points at /cv-download.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { AboutPage } from './pages/AboutPage';

test.describe('About', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'About' }));

  test('H1 contains the full name', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();
    await about.expectHeadingHasName();
  });

  test('renders the "At a glance" definition list', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();
    await about.expectGlanceListRendered();
  });

  test('Download CV link points at /cv-download', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();
    await about.expectDownloadCvPointsToEndpoint();
  });

  test('has at least one social link to a recognised network', async ({
    page,
  }) => {
    const about = new AboutPage(page);
    await about.goto();
    await about.expectHasSocialLinks();
  });
});