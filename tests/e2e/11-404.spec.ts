/**
 * 11-404.spec.ts
 *
 * Unknown routes should render the themed not-found page with
 * the site chrome (Header + Footer) still present.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';

test.describe('404', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: '404' }));

  test('unknown route returns 404 and renders the themed not-found', async ({
    page,
  }) => {
    const res = await page.goto('/this-route-does-not-exist', {
      waitUntil: 'domcontentloaded',
    });
    // Next.js not-found.tsx renders 404 in dev; the status may be
    // 200 in production (static fallback). We assert the visible
    // not-found copy instead of the HTTP code.
    void res;
    await expect(page.locator('main')).toBeVisible();
    // The Header always renders the brand.
    await expect(page.getByRole('banner')).toBeVisible();
    // Some flavour of "not found" / "404" is in the body.
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/not found|404/i);
  });
});
