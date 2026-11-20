/**
 * Phase 6 QA audit.
 *
 * Drives the built site with Playwright across four viewports and both
 * themes, and asserts the ten items in the refactor spec's Section 04
 * "Final QA Sign-Off Checklist".
 *
 * Run with the dev server up:  node scripts/qa-audit.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';
const OUT = 'qa-shots';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 },
];

const THEMES = ['dark', 'light'];

const results = [];
function record(vp, theme, item, pass, detail) {
  results.push({ vp, theme, item, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`${tag}  [${vp}/${theme}] ${item}${detail ? ` — ${detail}` : ''}`);
}

const SECTION_IDS = [
  'hero',
  'services',
  'work',
  'blog',
  'experience',
  'reviews',
  'contact',
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

    // Seed the persisted theme before the app boots.
    await ctx.addInitScript(
      ([t]) => window.localStorage.setItem('salekin-dev-theme', t),
      [theme],
    );

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);

    const tag = `${vp.name}/${theme}`;

    // ─── 1. All section anchors present and reachable ───────────────
    {
      const missing = [];
      for (const id of SECTION_IDS) {
        if (!(await page.locator(`#${id}`).count())) missing.push(id);
      }
      record(
        vp.name,
        theme,
        '1. All 7 section anchors present (#hero…#contact)',
        missing.length === 0,
        missing.length ? `missing ${missing.join(', ')}` : 'all present',
      );
    }

    // ─── 2. Theme applied and persisted ─────────────────────────────
    {
      const cls = await page.evaluate(() => document.documentElement.className);
      const attr = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme'),
      );
      const want = theme === 'dark' ? 'dark' : 'light';
      const ok = cls.includes(want) && attr === want;
      record(
        vp.name,
        theme,
        '2. Theme applied (class + data-theme)',
        ok,
        ok ? `class="${cls}" data-theme="${attr}"` : `class="${cls}" data-theme="${attr}"`,
      );
    }

    // ─── 3. No horizontal overflow ─────────────────────────────────
    {
      const over = await page.evaluate(() => {
        const d = document.documentElement;
        return {
          scroll: d.scrollWidth,
          client: d.clientWidth,
          offenders: Array.from(document.querySelectorAll('body *'))
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && (r.right > d.clientWidth + 2 || r.left < -2);
            })
            .slice(0, 5)
            .map((el) => `${el.tagName}.${String(el.className).slice(0, 60)}`),
        };
      });
      const ok = over.scroll <= over.client + 2;
      record(
        vp.name,
        theme,
        '3. No horizontal overflow',
        ok,
        ok ? `scrollW=${over.scroll} clientW=${over.client}` : `scrollW=${over.scroll} clientW=${over.client} :: ${over.offenders.join(' | ')}`,
      );
    }

    // ─── 4. Tight 1200px container ─────────────────────────────────
    {
      const widths = await page.evaluate(() =>
        Array.from(document.querySelectorAll('section[id] > div'))
          .map((el) => Math.round(el.getBoundingClientRect().width))
          .filter((w) => w > 0),
      );
      const over = widths.filter((w) => w > 1200);
      record(
        vp.name,
        theme,
        '4. Container capped at 1200px',
        over.length === 0,
        over.length ? `overflowing: ${over.join(', ')}` : `widths ${[...new Set(widths)].join('/')}`,
      );
    }

    // ─── 5. No dead vertical gaps between sections (hairline rhythm) ─
    {
      const gaps = await page.evaluate(() => {
        const secs = Array.from(document.querySelectorAll('section[id]'));
        const out = [];
        for (let i = 0; i < secs.length - 1; i++) {
          const a = secs[i].getBoundingClientRect();
          const b = secs[i + 1].getBoundingClientRect();
          out.push(Math.round(b.top - a.bottom));
        }
        return out;
      });
      const worst = Math.max(...gaps);
      record(
        vp.name,
        theme,
        '5. No dead gap between sections (<120px)',
        worst < 120,
        `gaps ${gaps.join(', ')}`,
      );
    }

    // ─── 6. Interactive elements meet tap-target size ──────────────
    {
      const small = await page.evaluate(() => {
        const sel = 'a[href], button:not([disabled]), input, textarea, select';
        return Array.from(document.querySelectorAll(sel))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (el.closest('[aria-hidden="true"]')) return false;
            // Inline links inside prose are exempt — a text link does
            // not need a 44px box.
            if (el.tagName === 'A' && el.closest('p, li, dd, blockquote')) return false;
            return r.height < 24;
          })
          .slice(0, 6)
          .map(
            (el) =>
              `${el.tagName}[${(el.textContent || '').trim().slice(0, 24)}] h=${Math.round(el.getBoundingClientRect().height)}`,
          );
      });
      record(
        vp.name,
        theme,
        '6. Interactive controls ≥24px tall',
        small.length === 0,
        small.length ? small.join(' | ') : 'all controls sized',
      );
    }

    // ─── 7. Contrast: body text meets WCAG AA (4.5:1) ──────────────
    {
      const fails = await page.evaluate(() => {
        function parse(c) {
          const m = c.match(/[\d.]+/g);
          return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
        }
        function lum([r, g, b]) {
          const f = (v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        }
        function bgOf(el) {
          let n = el;
          while (n && n !== document.documentElement) {
            const bg = getComputedStyle(n).backgroundColor;
            const a = bg.match(/[\d.]+/g);
            if (a && (a.length < 4 || Number(a[3]) > 0.85)) return parse(bg);
            n = n.parentElement;
          }
          return parse(getComputedStyle(document.body).backgroundColor);
        }
        const out = [];
        const targets = Array.from(
          document.querySelectorAll(
            'p, li, dd, dt, span, h1, h2, h3, h4, a, button, label, blockquote, code, td, th',
          ),
        ).filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          if (el.closest('[aria-hidden="true"]')) return false;
          const txt = (el.textContent || '').trim();
          if (!txt) return false;
          // Only leaf-ish text nodes matter.
          return !Array.from(el.children).some(
            (c) => (c.textContent || '').trim().length > 0,
          );
        });
        for (const el of targets.slice(0, 400)) {
          const cs = getComputedStyle(el);
          // Gradient text sets `color: transparent` and paints the
          // gradient through `background-clip: text`, so the computed
          // foreground colour is not what the user sees. Check the
          // gradient's own colour stops instead of the transparent
          // colour value.
          const clip = cs.webkitBackgroundClip || cs.backgroundClip;
          if (clip === 'text' && cs.backgroundImage.includes('gradient')) {
            const stops = cs.backgroundImage.match(
              /rgba?\([^)]+\)|#[0-9a-f]{3,8}/gi,
            );
            if (!stops || stops.length === 0) continue;
            const bg = bgOf(el);
            let worst = Infinity;
            for (const stop of stops) {
              const L1 = lum(parse(stop));
              const L2 = lum(bg);
              const r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
              if (r < worst) worst = r;
            }
            const size = parseFloat(cs.fontSize);
            const bold = Number(cs.fontWeight) >= 700;
            const large = size >= 24 || (size >= 18.66 && bold);
            const need = large ? 3 : 4.5;
            if (worst < need) {
              out.push(
                `${el.tagName}.grad ${size}px ratio=${worst.toFixed(2)} need=${need}`,
              );
            }
            continue;
          }
          const fg = parse(cs.color);
          const bg = bgOf(el);
          const L1 = lum(fg);
          const L2 = lum(bg);
          const ratio =
            (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const size = parseFloat(cs.fontSize);
          const bold = Number(cs.fontWeight) >= 700;
          const large = size >= 24 || (size >= 18.66 && bold);
          const need = large ? 3 : 4.5;
          if (ratio < need) {
            out.push(
              `${el.tagName}.${String(el.className).slice(0, 34)} ${size}px ratio=${ratio.toFixed(2)} need=${need}`,
            );
          }
        }
        return out.slice(0, 8);
      });
      record(
        vp.name,
        theme,
        '7. Text contrast meets WCAG AA',
        fails.length === 0,
        fails.length ? fails.join(' | ') : 'all sampled text passes',
      );
    }

    // ─── 8. Navbar scroll-spy highlights the visible section ────────
    {
      await page.locator('#work').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1400);
      const activeHref = await page.evaluate(() => {
        const el = document.querySelector(
          'nav[aria-label="Section navigation"] a[data-active="true"]',
        );
        return el ? el.getAttribute('href') : null;
      });
      const ok = activeHref === '#work';
      record(
        vp.name,
        theme,
        '8. Scroll-spy highlights the active section',
        ok,
        `active=${activeHref ?? 'none'}`,
      );
    }

    // ─── 9. Services → Contact pill handoff ────────────────────────
    {
      await page.locator('#services').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page
        .locator('#services button:has-text("Learn More")')
        .first()
        .click();
      await page.waitForTimeout(1400);
      const selected = await page.evaluate(() => {
        const pill = document.querySelector(
          '#contact button[aria-pressed="true"]',
        );
        return pill ? pill.textContent.trim() : null;
      });
      const ok = selected === 'Playwright Automation';
      record(
        vp.name,
        theme,
        '9. "Learn More" preselects the contact pill',
        ok,
        `selected=${selected ?? 'none'}`,
      );
    }

    // ─── 10. Console is clean ──────────────────────────────────────
    {
      const real = consoleErrors.filter(
        (e) =>
          !/favicon|404 \(Not Found\)|Failed to load resource/i.test(e),
      );
      record(
        vp.name,
        theme,
        '10. No console errors',
        real.length === 0,
        real.length ? real.slice(0, 3).join(' | ') : 'clean',
      );
    }

    await page.screenshot({
      path: `${OUT}/${vp.name}-${theme}-full.png`,
      fullPage: true,
    });
    await ctx.close();
  }
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log('\n────────────────────────────────');
console.log(`TOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`);
if (failed.length) {
  console.log('\nFAILURES:');
  for (const f of failed) console.log(`  [${f.vp}/${f.theme}] ${f.item} — ${f.detail}`);
  process.exit(1);
}
