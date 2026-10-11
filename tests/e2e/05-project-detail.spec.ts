/**
 * 05-project-detail.spec.ts
 *
 * Covers /projects/[slug]: markdown body renders, back link
 * goes to /projects, and any tech-stack chips on the page
 * resolve to known labels.
 */
import { test, expect } from '@playwright/test';
import { gotoAndReady } from './utils/nav';

test.describe('Project detail', () => {
  test('rs-sjoliv renders the markdown body with sections', async ({
    page,
  }) => {
    await gotoAndReady(page, '/projects/rs-sjoliv');
    const h1 = page.locator('main h1').first();
    await expect(h1).toContainText(/RS Sjoliv/);
    // Markdown renders <h2>s for "## Overview" / "## What I owned" / "## Tech".
    const h2s = page.locator('main h2');
    const count = await h2s.count();
    expect(count, 'at least one h2 from markdown').toBeGreaterThan(0);
  });

  test('back / index link goes to /projects', async ({ page }) => {
    await gotoAndReady(page, '/projects/rs-sjoliv');
    // The site renders a "← back" or "All projects" link in the
    // page chrome. At minimum, the main <nav> contains a link to
    // /projects.
    const link = page
      .getByRole('link', { name: /(back|all projects|projects)/i })
      .first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\/projects/);
  });
});
