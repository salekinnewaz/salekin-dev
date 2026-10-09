// Capture at mobile width
const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = '/Users/bs00902/Documents/specMd/scripts/.shots';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT = `${OUT_DIR}/hero-mobile-${stamp}.png`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/?nocache=' + Date.now(), {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(5500);
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('Wrote', OUT);
  await browser.close();
})();