#!/usr/bin/env node
// Screenshot the new /projects index (viewport-only) and a /projects/[slug] page.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const CHROMIUM_PATH =
  '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  for (const v of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const out = `/tmp/projects-${v.name}.png`;
    // fullPage:false to avoid stitching artifacts from off-screen fixed panels
    await page.screenshot({ path: out, fullPage: false });
    console.log(`Saved ${out}`);
    await ctx.close();
  }

  // Also screenshot a project detail page (mobile + desktop)
  for (const v of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/projects/specsmd`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const out = `/tmp/project-detail-${v.name}.png`;
    await page.screenshot({ path: out, fullPage: false });
    console.log(`Saved ${out}`);
    await ctx.close();
  }

  await browser.close();
})();
