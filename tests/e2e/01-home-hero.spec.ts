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
import { gotoAndReady } from './utils/nav';

test.describe('Home / Hero', () => {
  test('renders the H1 with first + last name', async ({ page }) => {
    await gotoAndReady(page, '/');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    // The hero renders "Salekin" (white) + "Newaz" (gradient).
    expect(text).toMatch(/Salekin/);
    expect(text).toMatch(/Newaz/);
  });

  test('renders the four focus chips', async ({ page }) => {
    await gotoAndReady(page, '/');
    const chips = page.locator('.focus-chip__label');
    await expect(chips).toHaveCount(4);
    await expect(chips.nth(0)).toHaveText('Playwright');
    await expect(chips.nth(1)).toHaveText('AI-Driven QA');
    await expect(chips.nth(2)).toHaveText('API Testing');
    await expect(chips.nth(3)).toHaveText('CI/CD');
  });

  test('renders the four hero orbit cards', async ({ page }) => {
    await gotoAndReady(page, '/');
    // The HeroOrbit renders 4 cards (one per capability area).
    const cards = page.locator('.hero-orbit__card');
    await expect(cards).toHaveCount(4);
  });

  test('renders the live HeroTerminal with its macOS chrome', async ({
    page,
  }) => {
    await gotoAndReady(page, '/');
    // The terminal title is `~/salekin — zsh` per the brief.
    await expect(
      page.getByText(/salekin.*zsh|~\/salekin/i).first(),
    ).toBeVisible();
    // The status badge is `● Always Learning`.
    await expect(page.getByText(/Always Learning/i)).toBeVisible();
  });

  test('availability badge is present and exposes a screen-reader label', async ({
    page,
  }) => {
    await gotoAndReady(page, '/');
    // The outer span carries the static aria-label; the animated
    // chars inside are aria-hidden. This is the source of truth
    // for assistive tech and is what we assert on.
    const badge = page.getByRole('status', {
      name: /open to interesting work/i,
    });
    await expect(badge).toBeVisible();
    // The pulsing dot and the static "Open to" label are both
    // always visible (independent of the chars' animation phase).
    await expect(badge.getByText(/Open to/i)).toBeVisible();
    // The 16 animated char spans + 1 caret span should be in the
    // DOM (their opacity cycles, but the elements are always there).
    const chars = badge.locator('.availability-badge__char');
    const caret = badge.locator('.availability-badge__caret');
    await expect(chars).toHaveCount(16);
    await expect(caret).toHaveCount(1);
  });

  test('ISTQB® Certified chip is preserved alongside the badge', async ({
    page,
  }) => {
    await gotoAndReady(page, '/');
    await expect(
      page.getByText(/ISTQB.*Certified/i).first(),
    ).toBeVisible();
  });
});
