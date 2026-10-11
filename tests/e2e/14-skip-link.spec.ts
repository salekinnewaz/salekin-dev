/**
 * 14-skip-link.spec.ts
 *
 * Keyboard accessibility: the first focusable element on the
 * page should be a "Skip to main content" link, and pressing
 * Enter on it should move focus to the <main> landmark.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import {
  assertFirstTabFocusesSkipLink,
  assertEnterLandsOnMain,
} from './pages/SkipLinkPage';

test.describe('Skip link', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Accessibility', feature: 'Skip link' }));

  test('Tab focuses the skip link first; Enter jumps to <main>', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await assertFirstTabFocusesSkipLink(page);
    await assertEnterLandsOnMain(page);
  });
});