#!/usr/bin/env node
// Visual audit — capture all screenshots to /Users/bs00902/Documents/specMd/scripts/screenshots/
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const OUT_DIR = '/Users/bs00902/Documents/specMd/scripts/screenshots';
await fs.mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

async function shot(name, opts = {}) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? false });
  console.log('saved', name);
}

async function scrollTo(sel) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, sel);
  await page.waitForTimeout(700);
}

async function setTheme(theme) {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  await page.waitForTimeout(200);
}

try {
  // 01 — dark mode (default)
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shot('audit-01-hero-dark.png');

  // 02 — light mode hero
  await setTheme('light');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await shot('audit-02-hero-light.png');

  // back to dark for the rest
  await setTheme('dark');

  // 03 — about
  await scrollTo('#about');
  await shot('audit-03-about-section.png');

  // 04 — experience
  await scrollTo('#experience');
  await shot('audit-04-experience-section.png');

  // 05 — skills
  await scrollTo('#skills');
  await shot('audit-05-skills-section.png');

  // 06 — education
  await scrollTo('#education');
  await shot('audit-06-education-section.png');

  // 07 — contact
  await scrollTo('#contact');
  await shot('audit-07-contact-section.png');

  // 08 — mobile 375
  await ctx.close();
  const mctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mpage = await mctx.newPage();
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(800);
  await mpage.evaluate(() => window.scrollTo(0, 0));
  await mpage.waitForTimeout(300);
  await mpage.screenshot({ path: path.join(OUT_DIR, 'audit-08-mobile-375.png') });
  console.log('saved audit-08-mobile-375.png');
  await mctx.close();

  // 09 — tablet 768
  const tctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tpage = await tctx.newPage();
  await tpage.goto(BASE, { waitUntil: 'networkidle' });
  await tpage.waitForTimeout(800);
  await tpage.evaluate(() => window.scrollTo(0, 0));
  await tpage.waitForTimeout(300);
  await tpage.screenshot({ path: path.join(OUT_DIR, 'audit-09-tablet-768.png') });
  console.log('saved audit-09-tablet-768.png');
  await tctx.close();

  // 10 — admin
  const actx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const apage = await actx.newPage();
  await apage.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await apage.waitForTimeout(800);
  await apage.screenshot({ path: path.join(OUT_DIR, 'audit-10-admin-page.png') });
  console.log('saved audit-10-admin-page.png');
  await actx.close();

  // 11 — projects
  const pctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const ppage = await pctx.newPage();
  await ppage.goto(`${BASE}/projects`, { waitUntil: 'networkidle' });
  await ppage.waitForTimeout(800);
  await ppage.evaluate(() => window.scrollTo(0, 0));
  await ppage.waitForTimeout(300);
  await ppage.screenshot({ path: path.join(OUT_DIR, 'audit-11-projects-page.png') });
  console.log('saved audit-11-projects-page.png');
  await pctx.close();
} catch (e) {
  console.error('AUDIT ERROR:', e);
  process.exit(1);
} finally {
  await browser.close();
}
console.log('done');
