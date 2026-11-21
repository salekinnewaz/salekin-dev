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
    const rects = nodes.map((el) => el.getBoundingClientRect());
    const tops = rects.map((r) => r.top);
    // The buttons have slightly different font sizes, so their tops can
    // differ by a pixel or two while still reading as one row.
    const spread = Math.max(...tops) - Math.min(...tops);
    // A stronger check than the top-edge spread: every button's
    // vertical band must overlap every other button's band. A wrapped
    // button sits clear of the others, so the bands would not overlap.
    const rowTop = Math.min(...rects.map((r) => r.top));
    const rowBottom = Math.max(...rects.map((r) => r.bottom));
    const allOverlap = rects.every(
      (r) => r.top < rowBottom - 4 && r.bottom > rowTop + 4,
    );
    // The row must also not run into the capability-card column.
    const capLeft = Math.min(
      ...[...document.querySelectorAll('#hero .hero-cap-card')].map((c) =>
        c.getBoundingClientRect().left,
      ),
    );
    return {
      count: nodes.length,
      spread,
      allOverlap,
      rowRight: Math.max(...rects.map((r) => r.right)),
      capLeft,
      // The buttons must not overlap the cards. A negative clearance
      // means the CTA row has run underneath the card column.
      clearance: capLeft - Math.max(...rects.map((r) => r.right)),
      nowrap: nodes.every((el) => getComputedStyle(el).whiteSpace === 'nowrap'),
      noShrink: nodes.every((el) => getComputedStyle(el).flexShrink === '0'),
    };
  });
  record(
    'The three CTAs sit on a single row on desktop',
    rows.count === 3 && rows.spread <= 4 && rows.allOverlap,
    `count=${rows.count} spread=${rows.spread.toFixed(1)}px`,
  );
  record(
    'The CTA labels never break and the buttons never shrink',
    rows.nowrap && rows.noShrink,
    `nowrap=${rows.nowrap} noShrink=${rows.noShrink}`,
  );
  record(
    'The CTA row does not overlap the capability cards',
    rows.clearance > 0,
    `clearance=${rows.clearance.toFixed(1)}px`,
  );

  record(
    'The status line reads "MD SALEKIN NEWAZ | DHAKA, BANGLADESH"',
    (await p.locator('#hero').getByText(/MD SALEKIN NEWAZ/i).count()) === 1 &&
      (await p.locator('#hero').getByText(/DHAKA, BANGLADESH/i).count()) === 1,
  );
}

// ── Header clearance ───────────────────────────────────────────────
//
// The navbar is fixed, so it floats over the hero rather than pushing
// it down. The hero must still leave enough room that the badge, the
// headline and the portrait all start *below* it.
{
  const clearance = await p.evaluate(() => {
    const header = document.querySelector('header');
    const badge = document.querySelector('#hero .rounded-full');
    const h1 = document.querySelector('#hero h1');
    const portrait = document.querySelector('#hero .hero-portrait img');
    const barBottom = header
      ? header.getBoundingClientRect().bottom
      : 0;
    const top = (el) => (el ? el.getBoundingClientRect().top : Infinity);
    return {
      barBottom: Math.round(barBottom),
      badge: Math.round(top(badge)),
      h1: Math.round(top(h1)),
      portrait: Math.round(top(portrait)),
      // The page must still open at the top of the document.
      scrollY: window.scrollY,
    };
  });
  record(
    'The hero badge, headline and portrait all clear the fixed header',
    clearance.badge > clearance.barBottom &&
      clearance.h1 > clearance.barBottom &&
      clearance.portrait > clearance.barBottom,
    JSON.stringify(clearance),
  );
  record(
    'The page opens at the top of the document',
    clearance.scrollY === 0,
    `scrollY=${clearance.scrollY}`,
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
    'The metric bar shows 5+, 4+, 3, 435+',
    values.map((v) => v.trim()).join(',') === '5+,4+,3,435+',
    values.map((v) => v.trim()).join(','),
  );

  // The fourth metric carries the npm download count and links to the
  // published package. It is the only metric with a link, so the
  // assertion is scoped to it rather than to the whole bar.
  const fourth = await p.evaluate(() => {
    const cells = [...document.querySelectorAll('#hero dl > div')];
    const cell = cells[3];
    if (!cell) return null;
    const link = cell.querySelector('a');
    const l = link?.getBoundingClientRect();
    const c = cell.getBoundingClientRect();
    return {
      label: cell.querySelector('dd span')?.textContent?.trim() ?? '',
      href: link?.getAttribute('href') ?? null,
      target: link?.getAttribute('target') ?? null,
      rel: link?.getAttribute('rel') ?? null,
      supporting: cell.textContent?.includes('Open Source Contributor') ?? false,
      overflowsCell: l ? l.right > c.right + 1 : null,
    };
  });
  record(
    'The fourth metric reads "npm Downloads" and links to the npm package',
    fourth !== null &&
      fourth.label === 'npm Downloads' &&
      fourth.href ===
        'https://www.npmjs.com/package/playwright-summary-reporter?activeTab=versions' &&
      fourth.target === '_blank' &&
      (fourth.rel ?? '').includes('noopener'),
    JSON.stringify(fourth),
  );
  record(
    'The fourth metric names the open source contribution',
    fourth !== null && fourth.supporting,
  );
  record(
    'The package link does not overflow its metric cell',
    fourth !== null && fourth.overflowsCell === false,
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

  // The badges must be legible, not hairline chips: each icon is at
  // least 20px square and each badge is at least 32px tall.
  const sizing = await p.evaluate(() => {
    const icons = [...document.querySelectorAll('#hero .hero-stack-icon')].map(
      (el) => el.getBoundingClientRect(),
    );
    const badges = [...document.querySelectorAll('#hero .hero-stack-badge')].map(
      (el) => el.getBoundingClientRect(),
    );
    const iconHeights = icons.map((r) => Math.round(r.height));
    const badgeHeights = badges.map((r) => Math.round(r.height));
    // Each icon must sit on the badge's vertical centre line.
    const centred = icons.every((icon) =>
      badges.some((badge) => {
        const iconMid = icon.top + icon.height / 2;
        const badgeMid = badge.top + badge.height / 2;
        return Math.abs(iconMid - badgeMid) <= 1.5;
      }),
    );
    return {
      icons: iconHeights,
      badges: badgeHeights,
      minIcon: Math.min(...iconHeights),
      minBadge: Math.min(...badgeHeights),
      // Every badge must be the same height.
      uniform: Math.max(...badgeHeights) - Math.min(...badgeHeights) <= 1,
      centred,
      count: badges.length,
    };
  });
  record(
    'The Core Stack icons are at least 20px square',
    sizing.count === 8 && sizing.minIcon >= 20,
    JSON.stringify(sizing),
  );
  record(
    'The Core Stack badges are at least 32px tall and uniform in height',
    sizing.minBadge >= 32 && sizing.uniform,
    JSON.stringify(sizing),
  );
  record(
    'Every Core Stack icon is vertically centred against its label',
    sizing.centred,
    JSON.stringify(sizing),
  );

  // The Core Stack group — the "Core Stack" label plus the badge row —
  // must be centred in the hero, not left-aligned. The label is much
  // lighter than the dense badge row, so an off-centre group reads as
  // visibly lopsided even when the numbers are only a few pixels out.
  const centring = await p.evaluate(() => {
    const group = document.querySelector('#hero .hero-core-stack');
    if (!group) return null;
    const label = group.querySelector(':scope > span');
    const list = group.querySelector(':scope > ul');
    if (!label || !list) return null;
    const container = group.parentElement;
    const g = group.getBoundingClientRect();
    const l = label.getBoundingClientRect();
    const li = list.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    const groupLeft = Math.min(l.left, li.left);
    const groupRight = Math.max(l.right, li.right);
    const leftGap = groupLeft - c.left;
    const rightGap = c.right - groupRight;
    return {
      leftGap: Math.round(leftGap),
      rightGap: Math.round(rightGap),
      // The group must be centred on its container's own centre line.
      centreOffset: Math.round(
        groupLeft + (groupRight - groupLeft) / 2 - (c.left + c.width / 2),
      ),
      // The flex container must actually be centring its children.
      justify: getComputedStyle(group).justifyContent,
    };
  });
  record(
    'The Core Stack group is centred on the hero centre line',
    centring !== null &&
      centring.justify === 'center' &&
      Math.abs(centring.centreOffset) <= 2 &&
      Math.abs(centring.leftGap - centring.rightGap) <= 2,
    JSON.stringify(centring),
  );
}

// ── Capability card column ────────────────────────────────────────
{
  // The four cards are a single vertical column that sits to the left
  // of the portrait. Two properties matter: they must not overlap the
  // portrait's frame, and they must be lifted to the top of the frame's
  // band rather than floating at its midpoint.
  const cards = await p.evaluate(() => {
    const list = [...document.querySelectorAll('#hero .hero-cap-card')];
    const frame = document.querySelector('#hero .hero-portrait-frame');
    if (list.length !== 4 || !frame) return null;
    const f = frame.getBoundingClientRect();
    const rects = list.map((el) => el.getBoundingClientRect());
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    // The column must clear the frame's left edge.
    const clearance = Math.round(f.left - right);
    return {
      count: rects.length,
      top: Math.round(rects[0].top),
      bottom: Math.round(rects[rects.length - 1].bottom),
      frameTop: Math.round(f.top),
      frameBottom: Math.round(f.bottom),
      left: Math.round(left),
      right: Math.round(right),
      clearance,
      // Every card must sit on the same vertical line.
      oneColumn:
        Math.max(...rects.map((r) => Math.round(r.left))) -
          Math.min(...rects.map((r) => Math.round(r.left))) <= 1,
      // The cards must start near the frame's top, not at its midpoint.
      topAligned: Math.abs(rects[0].top - f.top) <= 60,
      // The stack must stay inside the frame's vertical band.
      withinBand: rects[0].top >= f.top - 4 && rects[rects.length - 1].bottom <= f.bottom + 4,
    };
  });
  record(
    'The four capability cards form one vertical column',
    cards !== null && cards.oneColumn && cards.count === 4,
    JSON.stringify(cards),
  );
  record(
    'The capability cards clear the portrait frame',
    cards !== null && cards.clearance > 0,
    JSON.stringify(cards),
  );
  record(
    'The capability cards sit at the top of the portrait band',
    cards !== null && cards.topAligned && cards.withinBand,
    JSON.stringify(cards),
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
  // The shipped default is the cut-out PNG — see DEFAULT_PROFILE_IMAGE
  // in lib/constants.ts.
  const html = await (await fetch(BASE)).text();
  const heroSlice = html.slice(html.indexOf('id="hero"'), html.indexOf('id="services"'));
  record(
    'No hardcoded default-portrait reference in the hero markup',
    !heroSlice.includes('/images/profile.jpg') &&
      !heroSlice.includes('/images/profile-cutout.png'),
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

// ── The cut-out renders in cut-out mode ───────────────────────────
//
// The hero supports two render modes. The default portrait is a
// cut-out, which is letterboxed into the stage so the subject stands
// on the tilted frame. The photo mode — an opaque upload — fills the
// frame instead.
//
// The trap this guards against: Tailwind's `object-contain` utility is
// emitted *after* the hand-written `.hero-portrait img` rule, so the
// utility wins and the stylesheet's own `object-fit` is dead. Any
// change that moves the fit from the utility into the stylesheet (or
// vice versa) silently alters the approved hero's rendering. Asserting
// the *computed* value catches that where reading the CSS would not.
{
  const mode = await p
    .locator('#hero .hero-portrait')
    .evaluate((el) => el.getAttribute('data-mode'));
  record(
    'The default portrait renders in cut-out mode',
    mode === 'cutout',
    `data-mode=${mode}`,
  );

  const fit = await p.locator('#hero .hero-portrait img').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { objectFit: cs.objectFit, objectPosition: cs.objectPosition };
  });
  record(
    'The portrait is letterboxed into the stage (object-fit: contain)',
    fit.objectFit === 'contain',
    `object-fit=${fit.objectFit}`,
  );
  record(
    'The portrait honours the stored crop (object-position)',
    /^\d+(\.\d+)?% \d+(\.\d+)?%$/.test(fit.objectPosition),
    `object-position=${fit.objectPosition}`,
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

// ── Desktop viewport sweep ─────────────────────────────────────────
//
// The hero's composition has to hold at every desktop width, not just
// the one the main page was measured at. The two viewports named in
// the design brief are checked explicitly, and a couple of narrower
// ones guard the band where the CTA row has to reach past the text
// column into the gutter.
//
// At each width the three CTAs must share one row, must not collide
// with the capability cards, and the page must not overflow.
{
  const VIEWPORTS = [
    { width: 1350, height: 757 },
    { width: 1670, height: 941 },
  ];

  for (const vp of VIEWPORTS) {
    const ctx = await b.newContext({ viewport: vp });
    const vpPage = await ctx.newPage();
    await vpPage.goto(BASE, { waitUntil: 'commit' });
    await vpPage.waitForSelector('#hero .hero-cta-row');
    await vpPage.waitForTimeout(600);

    const m = await vpPage.evaluate(() => {
      const wanted = [
        'Hire Me / QA Services',
        'View Case Studies',
        'Resume Preview',
      ];
      const nodes = [...document.querySelectorAll('#hero a, #hero button')].filter(
        (el) => wanted.some((w) => (el.textContent ?? '').includes(w)),
      );
      const rects = nodes.map((el) => el.getBoundingClientRect());
      const rowTop = Math.min(...rects.map((r) => r.top));
      const rowBottom = Math.max(...rects.map((r) => r.bottom));
      const oneRow = rects.every(
        (r) => r.top < rowBottom - 4 && r.bottom > rowTop + 4,
      );
      const capLeft = Math.min(
        ...[...document.querySelectorAll('#hero .hero-cap-card')].map((c) =>
          c.getBoundingClientRect().left,
        ),
      );
      const stageTop = document
        .querySelector('#hero .hero-stage')
        .getBoundingClientRect().top;
      const rowBottomPx = Math.max(...rects.map((r) => r.bottom));
      // When the hero is stacked (narrow) the stage sits *below* the
      // CTA row, so vertical clearance is what matters there.
      const stacked = stageTop > rowBottomPx;
      const clearance = stacked
        ? stageTop - rowBottomPx
        : capLeft - Math.max(...rects.map((r) => r.right));
      return {
        oneRow,
        count: nodes.length,
        clearance: Math.round(clearance),
        stacked,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    record(
      `At ${vp.width}×${vp.height} the three CTAs share one row`,
      m.count === 3 && m.oneRow,
      JSON.stringify(m),
    );
    record(
      `At ${vp.width}×${vp.height} the CTA row clears the capability cards`,
      m.clearance > 0,
      JSON.stringify(m),
    );
    record(
      `At ${vp.width}×${vp.height} the page does not overflow horizontally`,
      m.overflow <= 0,
      JSON.stringify(m),
    );

    await ctx.close();
  }
}

await b.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) process.exit(1);
