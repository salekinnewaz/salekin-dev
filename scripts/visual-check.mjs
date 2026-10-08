#!/usr/bin/env node
// Re-capture with: theme menu open at the right time, and crop properly.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = 'scripts/screenshots';
const CHROMIUM_PATH = '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // Re-do click-skills but DON'T scroll the page (we'll just inspect the
  // highlight via the DOM, no navigation/visual confirmation needed there).
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.locator('.pill-nav__link[href="#skills"]').first().click();
  await page.waitForTimeout(500);
  // Scroll back to top so the header is visible for the screenshot.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/03b-clicked-skills-header.png`, clip: { x: 0, y: 0, width: 1280, height: 80 } });
  console.log('Saved 03b-clicked-skills-header.png');

  // Theme menu open, top-right corner cropped.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.locator('.theme-toggle__btn--menu').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/05b-theme-menu.png`, clip: { x: 950, y: 0, width: 330, height: 320 } });
  console.log('Saved 05b-theme-menu.png');

  await browser.close();
  console.log('\nDone.');
})();
