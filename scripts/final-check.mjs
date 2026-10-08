#!/usr/bin/env node
// Final visual confirmation — re-creates the user's original screenshot scenarios.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = 'scripts/screenshots';
const CHROMIUM_PATH = '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // USER SCENARIO 1: on /#about — About should be highlighted (was Home before).
  await page.goto(`${BASE}/#about`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/final-01-about-hash.png` });
  console.log('Saved final-01-about-hash.png — About pill should be highlighted');

  // USER SCENARIO 2: dark mode toggle — main button should switch theme.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/final-02-dark-default.png` });
  console.log('Saved final-02-dark-default.png — dark mode + moon icon visible');

  await page.locator('.theme-toggle__btn--main').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/final-03-after-toggle.png` });
  console.log('Saved final-03-after-toggle.png — should be light mode + sun icon');

  // Click it again to restore dark for next test
  await page.locator('.theme-toggle__btn--main').click();
  await page.waitForTimeout(200);

  // USER SCENARIO 3: click a top pill, see it highlight like Home.
  await page.locator('.pill-nav__link[href="#skills"]').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/final-04-clicked-skills.png` });
  console.log('Saved final-04-clicked-skills.png — Skills pill should be highlighted');

  await browser.close();
  console.log('\nAll done.');
})();