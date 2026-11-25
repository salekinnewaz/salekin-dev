/**
 * Hero layout QA.
 *
 * The hero's right-hand composition is a stage with a tilted portrait
 * frame and four capability cards stacked in a single vertical column
 * to its left, with the QA Pipeline floating over the portrait's lower
 * right. That geometry is easy to break with a spacing change, so this
 * asserts the invariants that matter across a sweep of viewport widths:
 *
 *   1. No horizontal overflow at any width.
 *   2. The cards stay a vertical column and never overlap the portrait.
 *   3. The portrait is never clipped off-screen.
 *   4. The QA Pipeline never overlaps the capability cards.
 *   5. All four cards are visible — none clipped away.
 *
 * Run with the dev server up:  node scripts/qa-hero-layout.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';

const WIDTHS = [
  1920, 1670, 1600, 1440, 1366, 1280, 1200, 1152, 1149, 1120, 1080, 1024,
  900, 768, 640, 480, 375, 320,
];

const results = [];
function record(item, pass, detail = '') {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1670, height: 941 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 941 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const m = await page.evaluate(() => {
    const portrait = document.querySelector('#hero .hero-portrait img');
    const frame = document.querySelector('#hero .hero-portrait-frame');
    const pipe = document.querySelector('#hero .hero-pipeline');
    const cards = [...document.querySelectorAll('#hero .hero-cap-card')];
    if (!portrait || !frame || !pipe || cards.length !== 4) return null;

    const p = portrait.getBoundingClientRect();
    const f = frame.getBoundingClientRect();
    const q = pipe.getBoundingClientRect();
    const doc = document.documentElement;

    let overlaps = 0;
    let clipped = 0;
    let cardPipeOverlap = 0;

    for (const card of cards) {
      const c = card.getBoundingClientRect();
      if (c.left < p.right && c.right > p.left && c.top < p.bottom && c.bottom > p.top) {
        overlaps += 1;
      }
      if (c.left < -1 || c.right > window.innerWidth + 1) clipped += 1;
      if (c.left < q.right && c.right > q.left && c.top < q.bottom && c.bottom > q.top) {
        cardPipeOverlap += 1;
      }
    }

    const cardLefts = cards.map((c) => Math.round(c.getBoundingClientRect().left));
    const cardTops = cards.map((c) => Math.round(c.getBoundingClientRect().top));
    // The number of distinct rows the four cards occupy.
    const gridRows = new Set(cardTops).size;

    return {
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      overlaps,
      clipped,
      cardPipeOverlap,
      oneColumn: new Set(cardLefts).size === 1,
      distinctRows: new Set(cardTops).size === 4,
      gridRows,
      portraitClipped: p.left < -1 || p.right > window.innerWidth + 1,
      frameClipped: f.right > window.innerWidth + 1,
      pipeClipped: q.right > window.innerWidth + 1,
      portraitW: Math.round(p.width),
      cardW: Math.round(cards[0].getBoundingClientRect().width),
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
  // Above 1023px the cards are a single vertical column to the left of
  // the portrait. Below that they reflow into a 2×2 grid underneath it
  // (a single column again under 640px) — either way the four cards must
  // never stack on top of one another.
  const columnOk =
    width <= 640
      ? m.oneColumn && m.distinctRows
      : width <= 1023
        ? m.distinctRows || m.gridRows === 2
        : m.oneColumn && m.distinctRows;
  record(
    `[${width}] The capability cards never stack on top of one another`,
    columnOk,
    `oneColumn=${m.oneColumn} distinctRows=${m.distinctRows} gridRows=${m.gridRows}`,
  );
  record(
    `[${width}] The QA Pipeline does not collide with the capability cards`,
    m.cardPipeOverlap === 0,
    `overlaps=${m.cardPipeOverlap}`,
  );
  record(
    `[${width}] The portrait and frame stay inside the viewport`,
    !m.portraitClipped && !m.frameClipped && !m.pipeClipped,
    `portrait=${m.portraitClipped} frame=${m.frameClipped} pipeline=${m.pipeClipped}`,
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
