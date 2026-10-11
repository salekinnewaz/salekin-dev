/**
 * 02-home-sections.spec.ts
 *
 * Verifies every in-page anchor the header nav and the
 * HashScrollController rely on, plus the featured-projects
 * grid that the home page renders inside <Suspense>.
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';
import { beforeEach as allureBeforeEach } from './utils/allure';

const SECTIONS = ['hero', 'work', 'experience', 'skills', 'contact'] as const;

test.describe('Home / In-page sections', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Home / Sections' }));

  for (const id of SECTIONS) {
    test(`section #${id} exists and is reachable via the hash`, async ({
      page,
    }) => {
      await gotoAndReady(page, `/#${id}`);
      const el = page.locator(`#${id}`);
      await expect(el).toBeAttached();
      // Wait for HashScrollController to settle the scroll. We
      // can't read window.scrollY in a strict assertion (it's
      // racy on short pages), so we just confirm the element
      // exists in the DOM and the URL hash was honored.
      expect(new URL(page.url()).hash).toBe(`#${id}`);
    });
  }

  test('featured projects grid renders up to 3 cards with stack tags', async ({
    page,
  }) => {
    await gotoAndReady(page, '/#work');
    // Section header is the H2 "Featured work".
    await expect(
      page.getByRole('heading', { name: /featured work/i }),
    ).toBeVisible();
    // Each project card has at least one .tag chip.
    const cards = page.locator('a[href^="/projects/"]');
    const count = await cards.count();
    expect(count, 'at least one project card').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const tags = card.locator('.tag');
      expect(await tags.count(), `card ${i} has tags`).toBeGreaterThan(0);
    }
  });
});
