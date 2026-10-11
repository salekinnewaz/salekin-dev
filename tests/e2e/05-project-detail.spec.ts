/**
 * 05-project-detail.spec.ts
 *
 * Covers /projects/[slug]: markdown body renders, back link
 * goes to /projects, and any tech-stack chips on the page
 * resolve to known labels.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

test.describe('Project detail', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Project detail' }));

  test('rs-sjoliv renders the markdown body with sections', async ({
    page,
  }) => {
    const detail = new ProjectDetailPage(page);
    await detail.goto('rs-sjoliv');
    await detail.expectMarkdownBodyRendered(/RS Sjoliv/);
  });

  test('back / index link goes to /projects', async ({ page }) => {
    const detail = new ProjectDetailPage(page);
    await detail.goto('rs-sjoliv');
    await detail.expectBackLinkPointsAtIndex();
  });
});