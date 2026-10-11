/**
 * 14-skip-link.spec.ts
 *
 * Keyboard accessibility: the first focusable element on the
 * page should be a "Skip to main content" link, and pressing
 * Enter on it should move focus to the <main> landmark.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';

test.describe('Skip link', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Accessibility', feature: 'Skip link' }));

  test('Tab focuses the skip link first; Enter jumps to <main>', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // First Tab.
    await page.keyboard.press('Tab');
    // The first focusable element is the skip link.
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    const text = (await focused.innerText()).toLowerCase();
    expect(text).toContain('skip');
    // Activating it moves the URL hash to #main.
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe('#main');
  });
});
