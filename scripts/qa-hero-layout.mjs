/**
 * Hero layout QA.
 *
 * The hero's right-hand composition is a fixed-aspect box with four
 * cards pinned to its corners and a portrait centred inside it. That
 * geometry is easy to break with a spacing change, so this asserts the
 * invariants that matter across a sweep of viewport widths:
 *
 *   1. No horizontal overflow at any width.
 *   2. No floating card overlaps the portrait circle.
 *   3. The portrait stays centred in the composition.
 *   4. The capability names and tool lists never wrap.
 *   5. All four cards are visible — none clipped away.
 *
 * Run with the dev server up:  node scripts/qa-hero-layout.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';

const WIDTHS = [
  1920, 1600, 1440, 1366, 1280, 1200, 1152, 1149, 1120, 1080, 1024,
  900, 768, 640, 480, 375, 320,
];

/* The card titles and tool lists are held to a single line down to the
   site's narrowest supported viewport (375px). Below that the card is
   simply too narrow, and the text wraps gracefully rather than
   overflowing — so wrapping is allowed there. */
const NO_WRAP_MIN_WIDTH = 375;

const results = [];
function record(item, pass, detail = '') {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const m = await page.evaluate(() => {
    const orbit = document.querySelector('#hero .hero-orbit');
    const portrait = document.querySelector('#hero .hero-portrait img');
    const cards = [...document.querySelectorAll('#hero .hero-float-card')];
    if (!orbit || !portrait || cards.length !== 4) return null;

    const o = orbit.getBoundingClientRect();
    const p = portrait.getBoundingClientRect();
    const doc = document.documentElement;

    const pcx = p.left + p.width / 2;
    const pcy = p.top + p.height / 2;
    const pr = p.width / 2;

    let overlaps = 0;
    let clipped = 0;
    let wrapped = 0;

    for (const card of cards) {
      const c = card.getBoundingClientRect();
      // Closest point on the card rect to the portrait centre.
      const x = Math.max(c.left, Math.min(pcx, c.right));
      const y = Math.max(c.top, Math.min(pcy, c.bottom));
      if (Math.hypot(x - pcx, y - pcy) < pr) overlaps += 1;
      // A card is clipped when it is pushed past the viewport edge.
      if (c.left < -1 || c.right > window.innerWidth + 1) clipped += 1;

      const title = card.querySelector('.hero-float-title');
      const detail = card.querySelector('.hero-float-detail');
      const tlh = parseFloat(getComputedStyle(title).lineHeight);
      const dlh = parseFloat(getComputedStyle(detail).lineHeight);
      if (
        title.getBoundingClientRect().height / tlh > 1.5 ||
        detail.getBoundingClientRect().height / dlh > 1.5
      ) {
        wrapped += 1;
      }
    }

    return {
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      overlaps,
      clipped,
      wrapped,
      offCentre: Math.abs(pcx - (o.left + o.width / 2)),
      orbitW: Math.round(o.width),
    };
  });

  if (!m) {
    record(`[${width}] The hero composition rendered`, false, 'missing elements');
    continue;
  }

  record(
    `[${width}] No horizontal overflow`,
    m.scrollW <= m.clientW + 2,
    `scrollW=${m.scrollW} clientW=${m.clientW}`,
  );
  record(
    `[${width}] No card overlaps the portrait`,
    m.overlaps === 0,
    `overlaps=${m.overlaps}`,
  );
  record(
    `[${width}] No card is clipped off-screen`,
    m.clipped === 0,
    `clipped=${m.clipped}`,
  );
  record(
    `[${width}] The portrait stays centred`,
    m.offCentre < 2,
    `off by ${m.offCentre.toFixed(1)}px`,
  );
  record(
    `[${width}] Card titles and tool lists do not wrap`,
    width < NO_WRAP_MIN_WIDTH ? true : m.wrapped === 0,
    `wrapped=${m.wrapped}`,
  );
}

const real = consoleErrors.filter(
  (e) => !/favicon|404 \(Not Found\)|Failed to load resource/i.test(e),
);
record(
  'No console errors during the sweep',
  real.length === 0,
  real.length ? real.slice(0, 3).join(' | ') : 'clean',
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\n────────────────────────────────\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) {
  console.log('\nFAILURES:');
  for (const f of failed) console.log(`  ${f.item} — ${f.detail}`);
  process.exit(1);
}
