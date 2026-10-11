/**
 * Shared E2E helpers.
 *
 *   expectStatusOk  — fetch a route via the request context and
 *                     assert it returns 200. Bypasses JS, so it
 *                     also catches SSR errors.
 *   gotoAndReady    — navigate and wait for `load` + the page to
 *                     be visually settled (the <main> landmark
 *                     exists and is connected). Used as the
 *                     entry point for every spec.
 */
import { expect, type Page, type APIRequestContext } from '@playwright/test';

export async function expectStatusOk(
  request: APIRequestContext,
  url: string,
): Promise<void> {
  const res = await request.get(url);
  expect(
    res.status(),
    `${url} returned ${res.status()} ${res.statusText()}`,
  ).toBe(200);
}

export async function gotoAndReady(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // The site chrome is server-rendered, so a <main> landmark is
  // present from the first paint. Wait for it to be visible.
  await page.locator('main').first().waitFor({ state: 'visible' });
}

/** Stable admin password used by playwright.config.ts's webServer env. */
export const ADMIN_PASSWORD = 'test-admin-pass-1234';
