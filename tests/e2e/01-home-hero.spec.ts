/**
 * 01-home-hero.spec.ts
 *
 * Verifies the home-page hero: the H1, the four focus chips,
 * the orbit cards, the live HeroTerminal, and the newly-shipped
 * availability badge.
 *
 * The availability badge's chars are animated and may be in their
 * "hidden" phase at the moment of the assertion, so we assert
 * on the always-rendered [aria-label] instead of visible chars.
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

  test('renders the four focus chips', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectFourFocusChips();
  });

  test('renders the four hero orbit cards', async ({ page }) => {
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

  test('availability badge is present and exposes a screen-reader label', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAvailabilityBadge();
  });

  test('ISTQB® Certified chip is preserved alongside the badge', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectIstqbChipVisible();
  });
});