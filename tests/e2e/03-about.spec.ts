/**
 * 03-about.spec.ts
 *
 * Covers /about: full name, "At a glance" dl, social links, and
 * the Download CV CTA that points at /cv-download.
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';

test.describe('About', () => {
  test('H1 contains the full name', async ({ page }) => {
    await gotoAndReady(page, '/about');
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    expect(text).toMatch(/Salekin/);
    expect(text).toMatch(/Newaz/);
  });

  test('renders the "At a glance" definition list', async ({ page }) => {
    await gotoAndReady(page, '/about');
    const dl = page.locator('dl').first();
    await expect(dl).toBeVisible();
    // Each <dt> has a corresponding <dd>.
    const dts = dl.locator('dt');
    const dds = dl.locator('dd');
    const dtCount = await dts.count();
    expect(dtCount, 'dl has dt entries').toBeGreaterThan(0);
    expect(await dds.count()).toBeGreaterThanOrEqual(dtCount);
  });

  test('Download CV link points at /cv-download', async ({ page }) => {
    await gotoAndReady(page, '/about');
    const link = page
      .getByRole('link', { name: /download.*cv|resume/i })
      .first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('/cv-download');
  });

  test('has at least one social link to a recognised network', async ({
    page,
  }) => {
    await gotoAndReady(page, '/about');
    const links = page.locator('a[href*="github.com"], a[href*="linkedin.com"]');
    expect(await links.count(), 'at least one social link').toBeGreaterThan(0);
  });
});
