/**
 * Phase 6 interaction audit.
 *
 * Covers the behaviours the layout audit cannot see: modal open/close
 * semantics (Escape, backdrop, body scroll lock), the Work filters, the
 * Blog live search and category tabs, the Reviews toggle, the article
 * reader's scroll progress and code copy, and the resume modal.
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';

const results = [];
function record(item, pass, detail = '') {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

// ─── Services capability grid ───────────────────────────────────
{
  const cards = await page.locator('#services .svc-card').count();
  record('Services renders six capability cards', cards === 6, `cards=${cards}`);

  const learnMore = await page
    .locator('#services button:has-text("Learn More")')
    .count();
  record(
    'Every capability card has a Learn More button',
    learnMore === 6,
    `buttons=${learnMore}`,
  );

  // Each card must carry its own accent family.
  const accents = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#services .svc-card')).map((el) =>
      el.getAttribute('data-accent'),
    ),
  );
  record(
    'Capability cards each carry a distinct accent family',
    new Set(accents).size === 6,
    accents.join(','),
  );

  // "Learn More" publishes the matching contact pill.
  await page
    .locator('#services button:has-text("Learn More")')
    .nth(2)
    .click();
  await page.waitForTimeout(1400);
  const selected = await page.evaluate(() => {
    const pill = document.querySelector('#contact button[aria-pressed="true"]');
    return pill ? pill.textContent.trim() : null;
  });
  record(
    'Services "Learn More" preselects the contact pill',
    selected === 'AI-Driven QA',
    `selected=${selected ?? 'none'}`,
  );
}

// ─── Case study modal ────────────────────────────────────────────
await page.locator('#work button:has-text("Read Case Study")').first().click();
await page.waitForTimeout(400);
{
  const dialog = await page.locator('[role="dialog"]').count();
  const locked = await page.evaluate(() => document.body.style.overflow);
  record('Case study modal opens', dialog === 1, `dialogs=${dialog}`);
  record('Case study modal locks body scroll', locked === 'hidden', `overflow=${locked}`);
}

// Escape closes it.
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
{
  const dialog = await page.locator('[role="dialog"]').count();
  const overflow = await page.evaluate(() => document.body.style.overflow);
  record('Escape closes the case study modal', dialog === 0, `dialogs=${dialog}`);
  record(
    'Body scroll lock released on close',
    overflow !== 'hidden',
    `overflow="${overflow}"`,
  );
}

// Backdrop click closes it.
await page.locator('#work button:has-text("Read Case Study")').first().click();
await page.waitForTimeout(400);
await page.mouse.click(20, 450);
await page.waitForTimeout(400);
{
  const dialog = await page.locator('[role="dialog"]').count();
  record('Backdrop click closes the modal', dialog === 0, `dialogs=${dialog}`);
}

// ─── Article reader modal ───────────────────────────────────────
await page.locator('#blog button:has-text("Read Article")').first().click();
await page.waitForTimeout(500);
{
  const dialog = await page.locator('[role="dialog"]').count();
  const progress = await page
    .locator('[role="progressbar"][aria-label="Article read progress"]')
    .count();
  const takeaways = await page.getByText('Key Takeaways').count();
  const nextLabel = await page.getByText('Next article').count();
  record('Article reader opens', dialog === 1, `dialogs=${dialog}`);
  record('Reader has a scroll progress bar', progress === 1, `bars=${progress}`);
  record('Reader has a Key Takeaways callout', takeaways >= 1, `count=${takeaways}`);
  record('Reader has Next Article navigation', nextLabel >= 1, `count=${nextLabel}`);
}

// Scroll the reader body and confirm the progress bar advances.
{
  const before = await page
    .locator('[role="progressbar"][aria-label="Article read progress"]')
    .getAttribute('aria-valuenow');
  await page.evaluate(() => {
    const body = document.querySelector('[role="dialog"] .overflow-y-auto');
    if (body) body.scrollTop = body.scrollHeight;
  });
  await page.waitForTimeout(500);
  const after = await page
    .locator('[role="progressbar"][aria-label="Article read progress"]')
    .getAttribute('aria-valuenow');
  record(
    'Reader scroll progress advances',
    Number(after) > Number(before),
    `${before}% → ${after}%`,
  );
}

// Next Article chains to the following post.
{
  const firstTitle = await page
    .locator('[role="dialog"] h2')
    .first()
    .textContent();
  await page.locator('[role="dialog"] button:has-text("Next article")').click();
  await page.waitForTimeout(400);
  const nextTitle = await page.locator('[role="dialog"] h2').first().textContent();
  record(
    'Next Article opens the following post',
    firstTitle !== nextTitle,
    `${firstTitle?.slice(0, 28)} → ${nextTitle?.slice(0, 28)}`,
  );
}

// ─── Work filters ───────────────────────────────────────────────
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
{
  const all = await page.locator('#work button:has-text("Read Case Study")').count();
  await page.locator('#work button:has-text("Open Source")').click();
  await page.waitForTimeout(400);
  const oss = await page.locator('#work button:has-text("Read Case Study")').count();
  const empty = await page.getByText('Open-source work is the spotlight above.').count();
  record(
    'Work filter "Open Source" hides the enterprise grid',
    oss === 0 && empty === 1,
    `all=${all} oss=${oss} emptyState=${empty}`,
  );

  await page.locator('#work button:has-text("Show Enterprise Work")').click();
  await page.waitForTimeout(400);
  const back = await page.locator('#work button:has-text("Read Case Study")').count();
  record(
    '"Show Enterprise Work" restores the grid',
    back === all,
    `${back}/${all}`,
  );
}

// ─── Blog live search ───────────────────────────────────────────
{
  await page.locator('#blog-search').fill('reporter');
  await page.waitForTimeout(400);
  const hits = await page.locator('#blog button:has-text("Read Article")').count();
  record('Blog live search filters the grid', hits === 1, `hits=${hits}`);

  await page.locator('#blog-search').fill('zzzznotathing');
  await page.waitForTimeout(400);
  const empty = await page.getByText('No notes match that search.').count();
  record('Blog search shows an empty state', empty === 1, `emptyState=${empty}`);

  await page.locator('#blog button:has-text("Clear filters")').click();
  await page.waitForTimeout(400);
  const restored = await page.locator('#blog button:has-text("Read Article")').count();
  record('"Clear filters" restores all notes', restored === 4, `count=${restored}`);
}

// ─── Blog category tabs ─────────────────────────────────────────
{
  // Scope to the filter row: article cards carry their own category
  // pill, which has the same label as the matching tab.
  const tab = page
    .locator('#blog [role="group"][aria-label="Filter articles"] button')
    .filter({ hasText: 'Playwright' });
  await tab.click();
  await page.waitForTimeout(400);
  const hits = await page.locator('#blog button:has-text("Read Article")').count();
  record('Blog category tab filters the grid', hits === 1, `hits=${hits}`);

  const allTab = page
    .locator('#blog [role="group"][aria-label="Filter articles"] button')
    .filter({ hasText: 'All' });
  await allTab.click();
  await page.waitForTimeout(400);
  const restored = await page.locator('#blog button:has-text("Read Article")').count();
  record('Blog "All" tab restores every note', restored === 4, `count=${restored}`);
}

// ─── Reviews toggle ─────────────────────────────────────────────
{
  const before = await page.locator('#reviews blockquote').count();
  await page.locator('#reviews button:has-text("Show 2 more")').click();
  await page.waitForTimeout(400);
  const after = await page.locator('#reviews blockquote').count();
  record('Reviews toggle reveals the remaining endorsements', after === 5, `${before} → ${after}`);
}

// ─── Resume modal ───────────────────────────────────────────────
{
  await page.locator('#hero button:has-text("Resume Preview")').click();
  await page.waitForTimeout(400);
  const dialog = await page.locator('[role="dialog"]').count();
  const download = await page
    .locator('[role="dialog"] a[download="Md_Salekin_Newaz.pdf"]')
    .count();
  const locked = await page.evaluate(() => document.body.style.overflow);
  record('Resume modal opens from the hero', dialog === 1, `dialogs=${dialog}`);
  record('Resume modal links the verified CV asset', download === 1, `links=${download}`);
  record('Resume modal locks body scroll', locked === 'hidden', `overflow=${locked}`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.locator('[role="dialog"]').count();
  const overflow = await page.evaluate(() => document.body.style.overflow);
  record('Escape closes the resume modal', closed === 0, `dialogs=${closed}`);
  record(
    'Body scroll lock released after the resume modal',
    overflow !== 'hidden',
    `overflow="${overflow}"`,
  );
}

// ─── Theme toggle persistence ───────────────────────────────────
{
  await page.locator('button[aria-label*="Theme"]').click();
  await page.waitForTimeout(400);
  const attr = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme'),
  );
  const stored = await page.evaluate(() =>
    window.localStorage.getItem('salekin-dev-theme'),
  );
  record(
    'Theme toggle flips and persists the theme',
    attr === 'light' && stored === 'light',
    `data-theme=${attr} stored=${stored}`,
  );

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme'),
  );
  record(
    'Theme survives a reload',
    after === 'light',
    `data-theme=${after}`,
  );
}

// ─── Mobile drawer (375px) ──────────────────────────────────────
{
  const mobile = await ctx.newPage();
  await mobile.setViewportSize({ width: 375, height: 812 });
  await mobile.goto(BASE, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(600);

  const trigger = mobile.locator('button[aria-controls="mobile-nav-drawer"]');
  record('Mobile drawer trigger is visible at 375px', await trigger.isVisible());

  await trigger.click();
  await mobile.waitForTimeout(450);

  const drawer = mobile.locator('#mobile-nav-drawer');
  const links = await drawer.locator('a[href]').count();
  const expanded = await trigger.getAttribute('aria-expanded');
  const locked = await mobile.evaluate(() => document.body.style.overflow);
  const opacity = await drawer.evaluate(
    (el) => Number(getComputedStyle(el).opacity),
  );
  record('Mobile drawer opens with all nav links', links === 7, `links=${links}`);
  record('Drawer trigger reports aria-expanded=true', expanded === 'true');
  record('Mobile drawer locks body scroll', locked === 'hidden', `overflow=${locked}`);
  record('Mobile drawer is actually visible', opacity > 0.9, `opacity=${opacity}`);

  // Escape closes it and releases the lock.
  await mobile.keyboard.press('Escape');
  await mobile.waitForTimeout(450);
  const expandedAfter = await trigger.getAttribute('aria-expanded');
  const overflow = await mobile.evaluate(() => document.body.style.overflow);
  const opacityAfter = await drawer.evaluate(
    (el) => Number(getComputedStyle(el).opacity),
  );
  record(
    'Escape closes the mobile drawer',
    expandedAfter === 'false' && opacityAfter < 0.1,
    `aria-expanded=${expandedAfter} opacity=${opacityAfter}`,
  );
  record(
    'Body scroll lock released after the drawer closes',
    overflow !== 'hidden',
    `overflow="${overflow}"`,
  );

  // Tapping a drawer link closes it and scrolls to the section.
  await trigger.click();
  await mobile.waitForTimeout(450);
  await drawer.locator('a[href*="blog"]').first().click();
  await mobile.waitForTimeout(900);
  const hash = await mobile.evaluate(() => window.location.hash);
  const expandedAfterNav = await trigger.getAttribute('aria-expanded');
  record(
    'Drawer link navigates and closes the drawer',
    hash === '#blog' && expandedAfterNav === 'false',
    `hash=${hash} aria-expanded=${expandedAfterNav}`,
  );

  await mobile.close();
}

// ─── No public /admin link anywhere ─────────────────────────────
{
  const adminLinks = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('a[href]')).filter(
        (a) => (a.getAttribute('href') || '').includes('/admin'),
      ).length,
  );
  record('No public /admin link is exposed', adminLinks === 0, `count=${adminLinks}`);
}

// ─── Real data preserved ────────────────────────────────────────
{
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) =>
      a.getAttribute('href'),
    ),
  );
  const required = [
    'mailto:salekinnewaz0@gmail.com',
    'tel:+88016408369595',
    'https://www.linkedin.com/in/md-salekin-newaz',
    'https://github.com/salekin-newaz',
  ];
  const missing = required.filter((r) => !links.includes(r));
  record(
    'Verified email, phone, LinkedIn and GitHub links are preserved',
    missing.length === 0,
    missing.length ? `missing ${missing.join(', ')}` : 'all present',
  );
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log('\n────────────────────────────────');
console.log(
  `TOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) {
  console.log('\nFAILURES:');
  for (const f of failed) console.log(`  ${f.item} — ${f.detail}`);
  process.exit(1);
}
