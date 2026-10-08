#!/usr/bin/env node
// Browser UI smoke test against http://localhost:3000.
// Run with: node scripts/verify-ui.mjs
//
// Verifies:
//   1. Pill nav: clicking "About" moves the active highlight to About.
//   2. Pill nav: direct load of /#about shows About active on first paint.
//   3. Theme toggle: main button toggles light<->dark and persists.
//   4. Theme toggle: chevron opens the 3-way menu.

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
// The dev container has chromium-1234 cached; Playwright 1.63 wants 1243
// which isn't downloaded. Point at the cached headless shell directly.
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  '/Users/bs00902/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const results = [];
function record(name, passed, detail) {
  results.push({ name, passed, detail });
  const tag = passed ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function captureConsole(page) {
  const messages = [];
  page.on('console', (msg) => {
    messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    messages.push({ type: 'pageerror', text: err.message });
  });
  return messages;
}

async function getActivePill(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.pill-nav__link[data-active="true"]');
    if (!el) return null;
    return {
      href: el.getAttribute('href'),
      text: el.textContent?.trim().split(/\s+/)[0] || null,
      hasIndicator: !!el.querySelector('.pill-nav__indicator'),
    };
  });
}

async function getDataTheme(page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

async function getLocalTheme(page) {
  return page.evaluate(() => localStorage.getItem('theme'));
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const consoleLog = await captureConsole(page);

  // ─── Test 1: click "About" → highlight moves to About ─────────────────
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('.pill-nav__link');
    const before = await getActivePill(page);
    record('initial active is Home', before?.href === '#hero', JSON.stringify(before));

    await page.locator('.pill-nav__link[href="#about"]').first().click();
    // Give React a tick to flush state + IO a chance to react.
    await page.waitForTimeout(200);
    const after = await getActivePill(page);
    record(
      'clicking About moves active to About',
      after?.href === '#about' && after?.hasIndicator === true,
      JSON.stringify(after),
    );

    // Verify Home no longer active
    const homeStillActive = await page
      .locator('.pill-nav__link[href="#hero"]')
      .first()
      .getAttribute('data-active');
    record('Home loses data-active after click', homeStillActive !== 'true', `data-active="${homeStillActive}"`);
  } catch (e) {
    record('Test 1 (pill click)', false, e.message);
  }

  // ─── Test 2: direct load of /#about → About active on first paint ─────
  try {
    await page.goto(`${BASE}/#about`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.pill-nav__link');
    // Wait a moment for any reactive correction.
    await page.waitForTimeout(300);
    const active = await getActivePill(page);
    record(
      'direct load /#about highlights About on first paint',
      active?.href === '#about',
      JSON.stringify(active),
    );
  } catch (e) {
    record('Test 2 (direct hash load)', false, e.message);
  }

  // ─── Test 3: theme toggle main button flips data-theme + persists ─────
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('.theme-toggle__btn--main');
    const themeBefore = await getDataTheme(page);
    const storedBefore = await getLocalTheme(page);

    await page.locator('.theme-toggle__btn--main').click();
    await page.waitForTimeout(150);
    const themeAfter = await getDataTheme(page);
    const storedAfter = await getLocalTheme(page);

    record(
      'main theme button toggles data-theme',
      themeBefore !== themeAfter && (themeAfter === 'light' || themeAfter === 'dark'),
      `before=${themeBefore} after=${themeAfter}`,
    );
    record(
      'theme choice persists to localStorage',
      storedAfter === 'light' || storedAfter === 'dark',
      `before=${storedBefore} after=${storedAfter}`,
    );

    // Toggle back so any subsequent test starts from a known state.
    await page.locator('.theme-toggle__btn--main').click();
    await page.waitForTimeout(100);
  } catch (e) {
    record('Test 3 (theme toggle)', false, e.message);
  }

  // ─── Test 4: chevron opens 3-way menu ────────────────────────────────
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('.theme-toggle__btn--menu');
    const menuVisibleBefore = await page
      .locator('.theme-menu')
      .first()
      .isVisible()
      .catch(() => false);

    await page.locator('.theme-toggle__btn--menu').click();
    await page.waitForTimeout(200);
    const menuVisibleAfter = await page.locator('.theme-menu').first().isVisible();
    const radioCount = await page.locator('.theme-menu [role="menuitemradio"]').count();

    record('menu hidden before chevron click', menuVisibleBefore === false, `visible=${menuVisibleBefore}`);
    record('menu visible after chevron click', menuVisibleAfter === true, `visible=${menuVisibleAfter}`);
    record('menu has 3 radio items', radioCount === 3, `count=${radioCount}`);

    // Close it again so we don't leave it open.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
  } catch (e) {
    record('Test 4 (chevron menu)', false, e.message);
  }

  // ─── Console errors (hydrations, etc.) ───────────────────────────────
  const pageErrors = consoleLog.filter((m) => m.type === 'error' || m.type === 'pageerror');
  const interesting = pageErrors.filter((m) => {
    const t = m.text.toLowerCase();
    return (
      t.includes('hydration') ||
      t.includes('mismatch') ||
      t.includes('failed to') ||
      t.includes('error')
    );
  });
  record(
    'no hydration errors or pageerror',
    interesting.length === 0,
    interesting.length ? JSON.stringify(interesting.slice(0, 3)) : `${pageErrors.length} total errors`,
  );

  // Print a summary of any console messages for context.
  console.log('\n--- Console messages (last 10) ---');
  for (const m of consoleLog.slice(-10)) {
    console.log(`[${m.type}] ${m.text.slice(0, 200)}`);
  }

  await browser.close();

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) {
    console.log('\nFailed checks:');
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
})();
