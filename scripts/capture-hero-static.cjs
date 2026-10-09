// Capture hero with the new static image at 1648x928.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = '/Users/bs00902/Documents/specMd/scripts/.shots';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT = `${OUT_DIR}/hero-static-${stamp}.png`;

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
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('Wrote', OUT);

  const geom = await page.evaluate(() => {
    const $ = (s) => document.querySelector(s);
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      h1: $('h1') ? {
        rect: rect($('h1')),
        text: $('h1').textContent,
        fontSize: getComputedStyle($('h1')).fontSize,
      } : null,
      staticImg: $('.hero-static__img') ? {
        rect: rect($('.hero-static__img')),
        naturalW: $('.hero-static__img').naturalWidth,
        naturalH: $('.hero-static__img').naturalHeight,
      } : null,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });
  console.log(JSON.stringify(geom, null, 2));
  await browser.close();
})();
