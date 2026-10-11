/**
 * 01-home-hero.spec.ts
 *
 * Verifies the home-page hero: the H1, the orbit cards, the live
 * HeroTerminal, and the availability badge.
 *
 * The hero now renders just two orbit cards (Playwright +
 * AI-Driven QA) — the broader skill list lives in Core Expertise.
 * The FOCUS chip row and the ISTQB® chip in the eyebrow have been
 * removed; the ISTQB certification is asserted on the Education &
 * Certifications section instead.
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

  test('renders the two hero orbit cards (Playwright + AI-Driven QA)', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectTwoOrbitCards();
  });

  test('renders the live HeroTerminal with its macOS chrome', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectHeroTerminalRenders();
  });

  test('primary CTA is "Explore My Work" and secondary is "Download Resume"', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(
      page.getByRole('link', { name: /explore my work/i }).first(),
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