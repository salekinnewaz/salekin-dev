/**
 * Hero QA.
 *
 * Asserts the hero's structure and content against the spec: the
 * header, the left column's badge / headline / copy / CTAs, the right
 * column's tilted portrait stage and the four capability cards stacked
 * in a single vertical column to its left, the QA Pipeline widget
 * floating over the portrait's lower right, the credibility metrics and
 * the Core Stack row.
 *
 * It also checks the geometry that the composition depends on — the
 * cards form one vertical column that sits to the LEFT of the
 * portrait, the portrait is large and prominent, and the pipeline card
 * overlaps the portrait rather than sitting below it.
 *
 * Run with the dev server up:  node scripts/qa-hero.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1670, height: 941 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));

const results = [];
const record = (item, pass, detail = '') => {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
};

await p.goto(BASE, { waitUntil: 'networkidle' });
await p.waitForTimeout(900);

// ── Header ────────────────────────────────────────────────────────
{
  const nav = await p.locator('header nav a').allTextContents();
  record(
    'Header nav has exactly Services/Work/Blog/Experience/Reviews/Contact',
    nav.length === 6 &&
      nav.join(',') === 'Services,Work,Blog,Experience,Reviews,Contact',
    nav.join(','),
  );
  record(
    'Header shows the SN logo and the salekin.dev wordmark',
    (await p.locator('header span:has-text("SN")').count()) === 1 &&
      (await p.locator('header a[aria-label*="salekin.dev"]').count()) === 1,
  );
  record(
    'Header has a theme toggle and a "Book QA Audit" action',
    (await p.locator('header button[aria-label*="Theme" i]').count()) === 1 &&
      // The CTA appears twice — once in the desktop bar and once in the
      // mobile drawer — so presence, not uniqueness, is the contract.
      (await p.locator('header a:has-text("Book QA Audit")').count()) >= 1,
  );
}

// ── Hero left column ──────────────────────────────────────────────
{
  const h1 = await p.locator('#hero h1').textContent();
  record(
    'H1 is "Build, Test and Ship Reliable Software."',
    /Build, Test and Ship/i.test(h1 ?? '') && /Reliable Software/i.test(h1 ?? ''),
    h1?.trim(),
  );

  record(
    'Badge reads "ISTQB® Certified · QA, Development & Delivery"',
    (await p.locator('#hero').getByText(/ISTQB® Certified · QA, Development & Delivery/).count()) === 1,
  );

  record(
    'The role label reads "SENIOR SOFTWARE QA ENGINEER"',
    (await p.locator('#hero').getByText(/senior software qa engineer/i).count()) >= 1,
  );

  const desc = await p.locator('#hero p').filter({ hasText: /across the full SDLC/ }).textContent();
  record(
    'Hero description matches the specified copy',
    /Senior Software QA Engineer with development experience/i.test(desc ?? '') &&
      /building quality, scalable, and user-friendly software/i.test(desc ?? '') &&
      /from development and testing to release and ongoing support/i.test(desc ?? ''),
    desc?.trim().slice(0, 80),
  );

  const ctas = await p.locator('#hero a, #hero button').allTextContents();
  const flat = ctas.map((t) => t.trim());
  record(
    'All three CTAs are present: Hire Me / QA Services, View Case Studies, Resume Preview',
    flat.some((t) => /Hire Me \/ QA Services/.test(t)) &&
      flat.some((t) => /View Case Studies/.test(t)) &&
      flat.some((t) => /Resume Preview/.test(t)),
    flat.filter(Boolean).join(' | '),
  );

  // All three CTAs must share a single row on desktop.
  const rows = await p.evaluate(() => {
    const wanted = ['Hire Me / QA Services', 'View Case Studies', 'Resume Preview'];
    const nodes = [...document.querySelectorAll('#hero a, #hero button')].filter((el) =>
      wanted.some((w) => (el.textContent ?? '').includes(w)),
    );
    const tops = nodes.map((el) => el.getBoundingClientRect().top);
    // The buttons have slightly different font sizes, so their tops can
    // differ by a pixel or two while still reading as one row.
    return { count: nodes.length, spread: Math.max(...tops) - Math.min(...tops) };
  });
  record(
    'The three CTAs sit on a single row on desktop',
    rows.count === 3 && rows.spread <= 4,
    `count=${rows.count} spread=${rows.spread.toFixed(1)}px`,
  );

  record(
    'The status line reads "MD SALEKIN NEWAZ | DHAKA, BANGLADESH"',
    (await p.locator('#hero').getByText(/MD SALEKIN NEWAZ/i).count()) === 1 &&
      (await p.locator('#hero').getByText(/DHAKA, BANGLADESH/i).count()) === 1,
  );
}

// ── Hero right column — portrait stage ────────────────────────────
{
  record(
    'The portrait renders inside a tilted frame',
    (await p.locator('#hero .hero-portrait-frame').count()) === 1 &&
      (await p.locator('#hero .hero-portrait img').count()) === 1,
  );

  const transform = await p
    .locator('#hero .hero-portrait-frame')
    .evaluate((el) => getComputedStyle(el).transform);
  record(
    'The frame is rotated (a tilted rectangle, not a circle)',
    transform.startsWith('matrix(') && transform !== 'matrix(1, 0, 0, 1, 0, 0)',
    transform,
  );

  const borderRadius = await p
    .locator('#hero .hero-portrait-frame')
    .evaluate((el) => getComputedStyle(el).borderRadius);
  record(
    'The frame keeps rounded corners (it is not a circular frame)',
    borderRadius !== '50%' && !borderRadius.includes('9999px'),
    borderRadius,
  );

  const glow = await p.locator('#hero .hero-portrait-frame').evaluate((el) =>
    getComputedStyle(el).boxShadow,
  );
  record(
    'The portrait frame carries an emerald/teal glow',
    glow !== 'none' && glow.length > 0,
    glow.slice(0, 70),
  );

  const radius = await p
    .locator('#hero .hero-portrait img')
    .evaluate((el) => getComputedStyle(el).borderRadius);
  record(
    'The portrait is not circularly cropped',
    radius === '0px' || radius === '',
    radius,
  );
}

// ── Hero right column — capability cards ──────────────────────────
{
  const cards = await p.locator('#hero .hero-cap-card').count();
  record('There are exactly four capability cards', cards === 4, `cards=${cards}`);

  const titles = await p
    .locator('#hero .hero-cap-card .hero-cap-title')
    .allTextContents();
  record(
    'The four cards are Frontend Development, Test Automation, AI-Driven QA, API & Performance',
    titles.join(',') ===
      'Frontend Development,Test Automation,AI-Driven QA,API & Performance',
    titles.join(','),
  );

  const details = await p
    .locator('#hero .hero-cap-card .hero-cap-detail')
    .allTextContents();
  record(
    'Each card lists its tools exactly as specified',
    details.join(' | ') ===
      'Angular · TypeScript | Playwright · CI/CD | Copilot · MCP · Claude | Postman · JMeter',
    details.join(' | '),
  );

  // The cards must form ONE vertical column, to the LEFT of the portrait.
  const layout = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('#hero .hero-cap-card')].map(
      (c) => c.getBoundingClientRect(),
    );
    const img = document.querySelector('#hero .hero-portrait img');
    const pr = img ? img.getBoundingClientRect() : null;
    const tops = cards.map((c) => Math.round(c.top));
    const lefts = cards.map((c) => Math.round(c.left));
    const widths = cards.map((c) => Math.round(c.width));
    return {
      count: cards.length,
      // One column means every card starts at the same x.
      oneColumn: new Set(lefts).size === 1,
      // One column means every card has a distinct y.
      distinctRows: new Set(tops).size === cards.length,
      // Consistent dimensions.
      consistentWidth: Math.max(...widths) - Math.min(...widths) <= 2,
      // The column must sit to the left of the portrait.
      leftOfPortrait: pr ? Math.max(...lefts) + widths[0] <= pr.left + 8 : false,
      overlap: pr
        ? cards.filter(
            (c) =>
              c.left < pr.right &&
              c.right > pr.left &&
              c.top < pr.bottom &&
              c.bottom > pr.top,
          ).length
        : -1,
      portraitWidth: pr ? Math.round(pr.width) : 0,
      portraitHeight: pr ? Math.round(pr.height) : 0,
    };
  });
  record(
    'The four capability cards form a single vertical column',
    layout.oneColumn && layout.distinctRows,
    JSON.stringify(layout),
  );
  record(
    'The capability cards have consistent dimensions',
    layout.consistentWidth,
    JSON.stringify(layout),
  );
  record(
    'The capability column sits to the LEFT of the portrait',
    layout.leftOfPortrait,
    JSON.stringify(layout),
  );
  record(
    'The capability cards do not overlap the portrait',
    layout.overlap === 0,
    `overlapping=${layout.overlap}`,
  );
  record(
    'The portrait is large and prominent (at least 300px wide)',
    layout.portraitWidth >= 300,
    `${layout.portraitWidth}x${layout.portraitHeight}`,
  );
}

// ── QA Pipeline ───────────────────────────────────────────────────
{
  const stages = await p.locator('#hero .hero-pipeline li').allTextContents();
  record(
    'The QA Pipeline widget has Build/Test/Quality/Release in order',
    stages.length === 4 &&
      stages[0].startsWith('Build') &&
      stages[1].startsWith('Test') &&
      stages[2].startsWith('Quality') &&
      stages[3].startsWith('Release'),
    stages.map((s) => s.split('\n')[0]).join(','),
  );

  record(
    'The QA Pipeline header shows the title and a "Passed" status',
    (await p.locator('#hero .hero-pipeline-bar').getByText('QA Pipeline').count()) === 1 &&
      (await p.locator('#hero .hero-pipeline-bar').getByText('Passed').count()) === 1,
  );

  // The pipeline must float OVER the portrait's lower-right, not sit
  // beneath it as a separate full-width section.
  const overlap = await p.evaluate(() => {
    const pipe = document.querySelector('#hero .hero-pipeline');
    const img = document.querySelector('#hero .hero-portrait img');
    const stage = document.querySelector('#hero .hero-portrait-stage');
    if (!pipe || !img || !stage) return null;
    const q = pipe.getBoundingClientRect();
    const i = img.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const overlapsPortrait =
      q.left < i.right && q.right > i.left && q.top < i.bottom && q.bottom > i.top;
    // It must be anchored to the stage's lower right.
    const anchoredRight = Math.abs(q.right - s.right) < 24;
    const inLowerHalf = q.top > s.top + s.height * 0.4;
    return { overlapsPortrait, anchoredRight, inLowerHalf, pipeTop: Math.round(q.top) };
  });
  record(
    'The QA Pipeline overlaps the portrait rather than sitting below it',
    overlap !== null && overlap.overlapsPortrait,
    JSON.stringify(overlap),
  );
  record(
    'The QA Pipeline is anchored to the lower-right of the portrait stage',
    overlap !== null && overlap.anchoredRight && overlap.inLowerHalf,
    JSON.stringify(overlap),
  );
}

// ── Metrics ───────────────────────────────────────────────────────
{
  const values = await p.locator('#hero dl dt').allTextContents();
  record(
    'The metric bar shows 5+, 4+, 3, 0-Dep',
    values.map((v) => v.trim()).join(',') === '5+,4+,3,0-Dep',
    values.map((v) => v.trim()).join(','),
  );

  const cols = await p.evaluate(() => {
    // The tiles are the direct <div> children of the metrics <dl>.
    const items = [...document.querySelectorAll('#hero dl > div')].map((d) =>
      Math.round(d.getBoundingClientRect().top),
    );
    return { count: items.length, sameRow: new Set(items).size === 1 };
  });
  record(
    'The four metric tiles sit on a single horizontal row',
    cols.count === 4 && cols.sameRow,
    JSON.stringify(cols),
  );
}

// ── Core Stack ────────────────────────────────────────────────────
{
  const stack = await p
    .locator('#hero .hero-stack-icon')
    .evaluateAll((icons) =>
      icons.map((i) => i.parentElement?.textContent?.trim() ?? ''),
    );
  record(
    'Core Stack lists the 8 technologies in the specified order',
    stack.join(',') ===
      'Playwright,TypeScript,JavaScript,Angular,GitHub Actions,Docker,AWS,MySQL',
    stack.join(','),
  );

  record(
    'Each Core Stack badge carries a technology icon',
    (await p.locator('#hero .hero-stack-icon svg').count()) === 8,
    `icons=${await p.locator('#hero .hero-stack-icon svg').count()}`,
  );
}

// ── No hardcoded portrait ─────────────────────────────────────────
{
  const src = await p.locator('#hero .hero-portrait img').getAttribute('src');
  record(
    'The hero portrait is NOT a hardcoded static asset',
    Boolean(src && src.startsWith('/profile-image')),
    `src=${src}`,
  );

  // The source must not contain the literal default path anywhere.
  const html = await (await fetch(BASE)).text();
  const heroSlice = html.slice(html.indexOf('id="hero"'), html.indexOf('id="services"'));
  record(
    'No hardcoded /images/profile.jpg reference in the hero markup',
    !heroSlice.includes('/images/profile.jpg'),
  );
}

// ── No layout shift ───────────────────────────────────────────────
{
  const img = await p.locator('#hero .hero-portrait img').evaluate((el) => ({
    width: el.getAttribute('width'),
    height: el.getAttribute('height'),
  }));
  record(
    'The portrait has explicit width/height attributes to prevent layout shift',
    img.width === '400' && img.height === '400',
    JSON.stringify(img),
  );
}

// ── No horizontal overflow ────────────────────────────────────────
{
  const overflow = await p.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }));
  record(
    'The page does not overflow horizontally at 1670px',
    overflow.doc <= overflow.win + 1,
    JSON.stringify(overflow),
  );
}

console.log('\nCONSOLE ERRORS:', errs.length ? errs.join('\n') : 'none');
await b.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) process.exit(1);
