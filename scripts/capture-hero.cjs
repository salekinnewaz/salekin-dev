// Capture a hero screenshot at 1440x900 to compare with the reference.
const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = '/Users/bs00902/Documents/specMd/scripts/.shots';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT = `${OUT_DIR}/hero-${stamp}.png`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    bypassCSP: true,
  });
  const page = await ctx.newPage();
  // Disable HTTP cache to force fresh render
  await page.route('**/*', (route) => route.continue());
  await page.goto('http://localhost:3000/?nocache=' + Date.now(), {
    waitUntil: 'networkidle',
  });

  // Wait for the terminal script to complete one full pass.
  await page.waitForTimeout(5500);

  // Screenshot the full first viewport.
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('Wrote', OUT);

  // Also dump the bounding box of key elements for geometry check.
  const geom = await page.evaluate(() => {
    const $ = (s) => document.querySelector(s);
    const rect = (el) => el ? el.getBoundingClientRect() : null;
    const h1 = $('h1');
    const photo = $('.hero-orbit__photo svg, .hero-orbit__photo');
    const orbit = $('.hero-orbit');
    const cards = Array.from(document.querySelectorAll('.hero-orbit__card'));
    const terminal = $('.terminal-card');
    const nav = $('header');
    const main = $('main');
    const heroEl = $('#hero');
    const leftCol = h1 && h1.closest('.grid') ? h1.closest('.grid').children[0] : null;
    const rightCol = h1 && h1.closest('.grid') ? h1.closest('.grid').children[1] : null;
    const eyebrow = document.querySelector('.eyebrow');
    const tagline = Array.from(document.querySelectorAll('p')).find((p) =>
      p.textContent && p.textContent.includes('Building quality infrastructure'),
    );

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      main: rect(main),
      hero: rect(heroEl),
      nav: rect(nav),
      leftCol: rect(leftCol),
      rightCol: rect(rightCol),
      eyebrow: rect(eyebrow),
      h1: rect(h1),
      h1Text: h1 ? h1.textContent : null,
      tagline: rect(tagline),
      orbit: rect(orbit),
      photo: rect(photo),
      cards: cards.map((c) => ({
        cls: c.className,
        rect: rect(c),
        title: c.querySelector('.hero-orbit__title')?.textContent,
      })),
      terminal: rect(terminal),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      h1FontWeight: h1 ? getComputedStyle(h1).fontWeight : null,
      h1Width: h1 ? h1.getBoundingClientRect().width : null,
      h1Height: h1 ? h1.getBoundingClientRect().height : null,
      photoSize: photo ? `${photo.getBoundingClientRect().width}x${photo.getBoundingClientRect().height}` : null,
    };
  });

  console.log(JSON.stringify(geom, null, 2));
  await browser.close();
})();
