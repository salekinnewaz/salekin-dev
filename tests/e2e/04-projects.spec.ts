/**
 * 04-projects.spec.ts
 *
 * Covers /projects: every seeded project renders, stack-tag
 * chips render, and each card links to its own /projects/[slug].
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';

test.describe('Projects index', () => {
  test('renders all seeded projects', async ({ page }) => {
    await gotoAndReady(page, '/projects');
    // The seed ships 3 projects: rs-sjoliv, client-norway-release,
    // client-international. Assert at least 3 cards.
    const cards = page.locator('a[href^="/projects/"]');
    const count = await cards.count();
    expect(count, 'at least 3 seeded projects').toBeGreaterThanOrEqual(3);
  });

  test('each card has a stack tag chip', async ({ page }) => {
    await gotoAndReady(page, '/projects');
    const cards = page.locator('a[href^="/projects/"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const tags = card.locator('.tag');
      expect(await tags.count(), `card ${i} stack tags`).toBeGreaterThan(0);
    }
  });

  test('the RS Sjoliv case study is linked from the index', async ({
    page,
  }) => {
    await gotoAndReady(page, '/projects');
    const link = page.locator('a[href="/projects/rs-sjoliv"]');
    await expect(link).toBeVisible();
  });
});
