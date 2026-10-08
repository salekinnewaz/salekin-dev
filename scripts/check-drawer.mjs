#!/usr/bin/env node
// Inspect why the right-side panel is showing on desktop.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const CHROMIUM_PATH =
  '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const drawer = document.querySelector('.drawer');
    const panel = document.querySelector('.drawer__panel');
    const hamburger = document.querySelector('.hamburger');
    return {
      drawerExists: !!drawer,
      drawerOpen: drawer?.getAttribute('data-open') ?? null,
      drawerRect: drawer ? drawer.getBoundingClientRect().toJSON() : null,
      panelRect: panel ? panel.getBoundingClientRect().toJSON() : null,
      panelTransform: panel ? getComputedStyle(panel).transform : null,
      panelDisplay: panel ? getComputedStyle(panel).display : null,
      panelPointerEvents: panel ? getComputedStyle(panel).pointerEvents : null,
      panelRight: panel ? getComputedStyle(panel).right : null,
      hamburgerDisplay: hamburger ? getComputedStyle(hamburger).display : null,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
