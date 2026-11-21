/**
 * Hero QA.
 *
 * Asserts the hero's structure and content against the spec: the
 * header, the left column's badge / headline / copy / CTAs, the right
 * column's portrait and the four orbiting capability cards, the QA
 * Pipeline widget, the credibility metrics and the Core Stack row.
 *
 * It also checks the geometry that the composition depends on — the
 * portrait is centred, the four cards sit inside the hero column, and
 * none of them overlaps the portrait circle.
 *
 * Run with the dev server up:  node scripts/qa-hero.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
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
}

// ── Hero right column ─────────────────────────────────────────────
{
  record(
    'The portrait renders as a circle inside a glow frame',
    (await p.locator('#hero .hero-portrait-frame').count()) === 1 &&
      (await p.locator('#hero .hero-portrait img').count()) === 1,
  );

  const radius = await p.locator('#hero .hero-portrait img').evaluate((el) =>
    getComputedStyle(el).borderRadius,
  );
  record(
    'The portrait is circular',
    radius.includes('999px') || radius === '50%',
    radius,
  );

  const glow = await p.locator('#hero .hero-portrait-frame').evaluate((el) =>
    getComputedStyle(el).boxShadow,
  );
  record(
    'The portrait frame carries an emerald/teal glow',
    glow !== 'none' && glow.length > 0,
    glow.slice(0, 70),
  );

  const cards = await p.locator('#hero .hero-float-card').count();
  record('There are exactly four floating capability cards', cards === 4, `cards=${cards}`);

  const titles = await p
    .locator('#hero .hero-float-card .hero-float-title')
    .allTextContents();
  record(
    'The four cards are Frontend Development, Test Automation, AI-Driven QA, API & Performance',
    titles.join(',') ===
      'Frontend Development,Test Automation,AI-Driven QA,API & Performance',
    titles.join(','),
  );

  const details = await p
    .locator('#hero .hero-float-card .hero-float-detail')
    .allTextContents();
  record(
    'Each card lists its tools exactly as specified',
    details.join(' | ') ===
      'Angular · TypeScript | Playwright · CI/CD | Copilot · MCP · Claude | Postman · JMeter',
    details.join(' | '),
  );

  // The cards must not overlap the portrait's circle.
  const overlap = await p.evaluate(() => {
    const portrait = document.querySelector('#hero .hero-portrait img');
    if (!portrait) return 'no portrait';
    const pr = portrait.getBoundingClientRect();
    const pc = {
      left: pr.left + pr.width / 2,
      top: pr.top + pr.height / 2,
      r: pr.width / 2,
    };
    const hits = [];
    for (const card of document.querySelectorAll('#hero .hero-float-card')) {
      const cr = card.getBoundingClientRect();
      // Closest point on the card rect to the portrait centre.
      const x = Math.max(cr.left, Math.min(pc.left, cr.right));
      const y = Math.max(cr.top, Math.min(pc.top, cr.bottom));
      const d = Math.hypot(x - pc.left, y - pc.top);
      if (d < pc.r) hits.push(card.className.slice(0, 30));
    }
    return hits;
  });
  record(
    'No floating card overlaps the portrait circle',
    Array.isArray(overlap) && overlap.length === 0,
    JSON.stringify(overlap),
  );

  // All four cards must be inside the hero's right-hand column — they
  // may not bleed into the left column's copy or off the viewport.
  const geometry = await p.evaluate(() => {
    const orbit = document.querySelector('#hero .hero-orbit');
    const portrait = document.querySelector('#hero .hero-portrait img');
    if (!orbit || !portrait) return null;
    const o = orbit.getBoundingClientRect();
    const pr = portrait.getBoundingClientRect();
    const cards = [...document.querySelectorAll('#hero .hero-float-card')].map(
      (c) => c.getBoundingClientRect(),
    );
    const out = [];
    for (const c of cards) {
      if (c.left < o.left - 1 || c.right > o.right + 1) out.push('outside-orbit');
      if (c.left < 0 || c.right > window.innerWidth) out.push('outside-viewport');
    }
    return {
      issues: out,
      // The portrait must sit on the composition's horizontal centre.
      portraitCentred: Math.abs(
        pr.left + pr.width / 2 - (o.left + o.width / 2),
      ),
    };
  });
  record(
    'All four cards sit inside the hero column',
    geometry !== null && geometry.issues.length === 0,
    JSON.stringify(geometry),
  );
  record(
    'The portrait is centred in the composition',
    geometry !== null && geometry.portraitCentred < 2,
    geometry ? `off-centre by ${geometry.portraitCentred.toFixed(1)}px` : 'no geometry',
  );

  // ── QA Pipeline ────────────────────────────────────────────────
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
}

// ── Metrics ───────────────────────────────────────────────────────
{
  const values = await p.locator('#hero dl dt').allTextContents();
  record(
    'The metric bar shows 5+, 4+, 3, 0-Dep',
    values.map((v) => v.trim()).join(',') === '5+,4+,3,0-Dep',
    values.map((v) => v.trim()).join(','),
  );
}

// ── Core Stack ────────────────────────────────────────────────────
{
  const stack = await p.locator('#hero ul li span').allTextContents();
  record(
    'Core Stack lists the 8 technologies in the specified order',
    stack.map((s) => s.trim()).join(',') ===
      'Playwright,TypeScript,JavaScript,Angular,GitHub Actions,Docker,AWS,MySQL',
    stack.map((s) => s.trim()).join(','),
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
    hasClass: el.className.includes('aspect'),
  }));
  record(
    'The portrait has explicit width/height attributes to prevent layout shift',
    img.width === '320' && img.height === '320',
    JSON.stringify(img),
  );
}

console.log('\nCONSOLE ERRORS:', errs.length ? errs.join('\n') : 'none');
await b.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) process.exit(1);
