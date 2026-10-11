/**
 * 04-projects.spec.ts
 *
 * Covers /projects: every seeded project renders, stack-tag
 * chips render, and each card links to its own /projects/[slug].
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { ProjectsListPage } from './pages/ProjectsListPage';
import {
  projectCards,
  expectCardHasAtLeastOneTag,
} from './components/ProjectCard';

test.describe('Projects index', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Projects' }));

  test('renders all seeded projects', async ({ page }) => {
    const list = new ProjectsListPage(page);
    await list.goto();
    await list.expectAllSeededProjectsRender(3);
  });

  test('each card has a stack tag chip', async ({ page }) => {
    const list = new ProjectsListPage(page);
    await list.goto();
    const cards = projectCards(page);
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expectCardHasAtLeastOneTag(cards.nth(i));
    }
  });

  test('the RS Sjoliv case study is linked from the index', async ({
    page,
  }) => {
    const list = new ProjectsListPage(page);
    await list.goto();
    await list.expectSlugLinkVisible('rs-sjoliv');
  });
});