/**
 * 01-home-hero.spec.ts
 *
 * Verifies the home-page hero: the H1, the orbit cards (4 of them:
 * Playwright, AI-Driven QA, API Testing, CI/CD), the FOCUS chip row,
 * the live HeroTerminal, and the availability badge + ISTQB chip.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { HomePage } from './pages/HomePage';

test.describe('Home / Hero', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Home / Hero' }));

  test('renders the H1 with first + last name', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectHeroHeadingHasName();
  });

  test('renders the four hero orbit cards (Playwright, AI-Driven QA, API Testing, CI/CD)', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectFourOrbitCards();
  });

  test('renders the live HeroTerminal with its macOS chrome', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectHeroTerminalRenders();
  });

  test('primary CTA is "View My Work" and secondary is "Download Resume"', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(
      page.getByRole('link', { name: /view my work/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /download resume/i }).first(),
    ).toBeVisible();
  });

  test('availability badge is present and exposes a screen-reader label', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAvailabilityBadge();
  });
});