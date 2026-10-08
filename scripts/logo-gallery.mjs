#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const CHROMIUM_PATH = '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
mkdirSync('scripts/screenshots', { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Hero with brand mark
  await page.screenshot({ path: 'scripts/screenshots/logo-hero.png' });

  // Header in light mode
  await page.locator('.theme-toggle__btn--main').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/screenshots/logo-header-light.png', clip: { x: 0, y: 0, width: 700, height: 80 } });
  // back to dark
  await page.locator('.theme-toggle__btn--main').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/screenshots/logo-header-dark.png', clip: { x: 0, y: 0, width: 700, height: 80 } });

  await browser.close();
  console.log('Done');
})();