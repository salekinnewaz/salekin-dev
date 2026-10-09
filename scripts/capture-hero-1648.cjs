// Capture a hero screenshot at 1648x928 to compare with the target reference.
const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = '/Users/bs00902/Documents/specMd/scripts/.shots';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT = `${OUT_DIR}/hero-1648-${stamp}.png`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1648, height: 928 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    bypassCSP: true,
  });
  const page = await ctx.newPage();
  await page.route('**/*', (route) => route.continue());
  await page.goto('http://localhost:3000/?nocache=' + Date.now(), {
    waitUntil: 'networkidle',
  });
  // Wait for terminal to settle
  await page.waitForTimeout(5500);

  await page.screenshot({ path: OUT, fullPage: false });
  console.log('Wrote', OUT);

  const geom = await page.evaluate(() => {
    const $ = (s) => document.querySelector(s);
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const h1 = $('h1');
    const photo = $('.hero-orbit__photo svg, .hero-orbit__photo');
    const orbit = $('.hero-orbit');
    const cards = Array.from(document.querySelectorAll('.hero-orbit__card'));
    const terminal = $('.terminal-card');
    const header = $('header');
    const main = $('main');
    const heroEl = $('#hero');
    const eyebrow = document.querySelector('.eyebrow');
    const tagline = Array.from(document.querySelectorAll('p')).find((p) =>
      p.textContent && p.textContent.includes('Building quality infrastructure'),
    );

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      main: rect(main),
      hero: rect(heroEl),
      header: rect(header),
      headerVisible: header ? getComputedStyle(header).display !== 'none' : false,
      headerHeight: header ? header.getBoundingClientRect().height : null,
      eyebrow: rect(eyebrow),
      h1: rect(h1),
      h1Text: h1 ? h1.textContent : null,
      tagline: rect(tagline),
      orbit: rect(orbit),
      photo: rect(photo),
      photoSize: photo ? `${photo.getBoundingClientRect().width}x${photo.getBoundingClientRect().height}` : null,
      cards: cards
        .filter((c) => c.getBoundingClientRect().width > 0)
        .map((c) => ({
          cls: c.className,
          rect: rect(c),
          title: c.querySelector('.hero-orbit__title')?.textContent,
          iconColor: c.querySelector('.hero-orbit__icon')
            ? getComputedStyle(c.querySelector('.hero-orbit__icon')).color
            : null,
        })),
      terminal: rect(terminal),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      h1FontWeight: h1 ? getComputedStyle(h1).fontWeight : null,
    };
  });

  console.log(JSON.stringify(geom, null, 2));
  await browser.close();
})();