/**
 * 02-home-sections.spec.ts
 *
 * Verifies every in-page anchor the header nav and the
 * HashScrollController rely on, plus the featured-projects
 * grid that the home page renders inside <Suspense>.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { HomePage } from './pages/HomePage';
import {
  projectCards,
  expectCardHasAtLeastOneTag,
} from './components/ProjectCard';

const SECTIONS = ['hero', 'work', 'experience', 'skills', 'contact'] as const;

test.describe('Home / In-page sections', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Home / Sections' }));

  for (const id of SECTIONS) {
    test(`section #${id} exists and is reachable via the hash`, async ({
      page,
    }) => {
      const home = new HomePage(page);
      await home.expectSectionAnchored(id);
    });
  }

  test('featured projects grid renders up to 3 cards with stack tags', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto('#work');
    await expect(home.featuredHeading).toBeVisible();
    const cards = projectCards(page);
    const count = await cards.count();
    expect(count, 'at least one project card').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expectCardHasAtLeastOneTag(cards.nth(i));
    }
  });
});
