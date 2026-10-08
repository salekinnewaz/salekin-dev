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
  // Header crop
  await page.screenshot({ path: 'scripts/screenshots/logo-01-header.png', clip: { x: 0, y: 0, width: 600, height: 80 } });
  // Hover state
  await page.locator('.brand').hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/screenshots/logo-02-header-hover.png', clip: { x: 0, y: 0, width: 600, height: 80 } });
  // Full top area
  await page.locator('body').hover({ position: { x: 1, y: 400 } });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'scripts/screenshots/logo-03-header-full.png', clip: { x: 0, y: 0, width: 1280, height: 80 } });
  // Just the mark, larger
  const svg = page.locator('.brand__mark svg');
  await svg.screenshot({ path: 'scripts/screenshots/logo-04-mark-only.png' });
  // favicon fetch
  const favicon = await page.evaluate(async () => {
    const r = await fetch('/icon');
    return { ok: r.ok, type: r.headers.get('content-type'), size: r.headers.get('content-length') };
  });
  console.log('favicon:', favicon);
  await browser.close();
  console.log('Saved 4 logo screenshots');
})();