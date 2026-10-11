/**
 * SkipLinkPage
 *
 * Page-agnostic keyboard skip-link assertion. The first
 * focusable element on every page should be a "Skip to main
 * content" link, and pressing Enter should jump focus (and
 * the URL hash) to `#main`.
 *
 * Implemented as named-export functions rather than a class
 * because the skip link is not bound to a specific page —
 * the same flow works for every route.
 */
import { expect, type Page, type Locator } from '@playwright/test';

export async function assertFirstTabFocusesSkipLink(
  page: Page,
): Promise<void> {
  await page.keyboard.press('Tab');
  const focused: Locator = page.locator(':focus');
  await expect(focused).toBeVisible();
  const text = (await focused.innerText()).toLowerCase();
  expect(text).toContain('skip');
}

export async function assertEnterLandsOnMain(page: Page): Promise<void> {
  await page.keyboard.press('Enter');
  expect(new URL(page.url()).hash).toBe('#main');
}
