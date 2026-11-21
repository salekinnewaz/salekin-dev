/**
 * Profile image QA.
 *
 * Drives the admin panel's Profile Image manager end to end: pick a
 * file, preview it, save it, confirm the public `/profile-image` route
 * serves the uploaded bytes, confirm the hero picks the new image up
 * with a fresh cache-busting token, confirm it survives a reload, and
 * confirm restore-default falls back to the shipped portrait.
 *
 * Run with the dev server up:  node scripts/qa-profile.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1200 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

const results = [];
const record = (item, pass, detail = '') => {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
};

// ── Admin page loads with the image manager ──────────────────────
await p.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

// When an admin password is configured, sign in first so the panel
// renders. Locally there is usually no password and the panel is open.
if (p.url().includes('/admin/login')) {
  const password = process.env.QA_ADMIN_PASSWORD;
  if (!password) {
    console.error(
      'The admin panel is gated but QA_ADMIN_PASSWORD was not set — ' +
        'cannot sign in to reach the panel.',
    );
    await b.close();
    process.exit(1);
  }
  await p.locator('input[type="password"]').fill(password);
  await p.locator('button[type="submit"]').click();
  await p.waitForURL((u) => !u.toString().includes('/admin/login'), {
    timeout: 15000,
  });
  await p.waitForTimeout(800);
}

record(
  'Admin panel renders the profile image section',
  (await p.getByText('Profile image', { exact: true }).count()) >= 1,
);
record(
  'Upload control is present with the right accept list',
  (await p.locator('input[type="file"][accept*="image/png"]').count()) === 1,
);
record(
  'Restore-default action is present',
  (await p.locator('button:has-text("restore default image")').count()) === 1,
);
record(
  'Reposition crop sliders are present',
  (await p.locator('input[type="range"]').count()) === 2,
);

// ── Upload a real PNG and verify it persists ─────────────────────
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHUlEQVQoU2NkYGD4z0AEYBxVSFJoMY4qJCm0GEcVAd0kAAqSBTfaAx9qAAAAAElFTkSuQmCC',
  'base64',
);
await p.locator('input[type="file"]').setInputFiles({
  name: 'portrait.png',
  mimeType: 'image/png',
  buffer: png,
});
await p.waitForTimeout(500);
record(
  'Selecting a file enables the upload button',
  await p.locator('button:has-text("upload & save")').isEnabled(),
);

await p.locator('button:has-text("upload & save")').click();
await p.waitForTimeout(2500);

const saved = await p.getByText(/profile image updated/i).count();
record('Upload saves and reports success', saved >= 1, `matches=${saved}`);

// ── The stored row now has an image ──────────────────────────────
const check = await p.evaluate(async () => {
  const r = await fetch('/profile-image', { cache: 'no-store' });
  return {
    status: r.status,
    type: r.headers.get('content-type'),
    redirected: r.redirected,
    url: r.url,
  };
});
record(
  'The public route now serves the uploaded image directly',
  check.status === 200 && check.type === 'image/png' && !check.redirected,
  JSON.stringify(check),
);

// ── The hero picks it up without a redeploy ──────────────────────
const home = await ctx.newPage();
await home.goto(BASE, { waitUntil: 'networkidle' });
await home.waitForTimeout(800);
const heroSrc = await home.locator('.hero-portrait img').getAttribute('src');
record(
  'The hero points at the managed portrait route with a version token',
  Boolean(heroSrc && heroSrc.startsWith('/profile-image?v=')),
  `src=${heroSrc}`,
);

const naturalW = await home.locator('.hero-portrait img').evaluate(
  (el) => el.naturalWidth,
);
record('The hero image actually loads (non-zero naturalWidth)', naturalW > 0, `naturalWidth=${naturalW}`);

// ── Persistence across a full reload ─────────────────────────────
await home.reload({ waitUntil: 'networkidle' });
await home.waitForTimeout(600);
const heroSrc2 = await home.locator('.hero-portrait img').getAttribute('src');
const naturalW2 = await home.locator('.hero-portrait img').evaluate(
  (el) => el.naturalWidth,
);
record(
  'The portrait survives a page reload',
  naturalW2 > 0 && heroSrc2 === heroSrc,
  `src=${heroSrc2} naturalWidth=${naturalW2}`,
);

// ── Restore default ──────────────────────────────────────────────
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(700);
await p.locator('button:has-text("restore default image")').click();
await p.waitForTimeout(2500);
const restored = await p.getByText(/restored the default portrait/i).count();
record('Restore-default reports success', restored >= 1, `matches=${restored}`);

const check2 = await p.evaluate(async () => {
  const r = await fetch('/profile-image', { cache: 'no-store' });
  return { status: r.status, url: r.url, redirected: r.redirected };
});
record(
  'After restore the route falls back to the default portrait',
  check2.redirected || check2.url.endsWith('/images/profile.jpg'),
  JSON.stringify(check2),
);

console.log('\nCONSOLE ERRORS:', errs.length ? errs.join('\n') : 'none');
await b.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) process.exit(1);
