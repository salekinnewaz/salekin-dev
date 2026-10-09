// Capture console errors from the dev server
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1648, height: 928 },
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();
  const errors = [];
  const consoleMsgs = [];
  page.on('console', (msg) => {
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    errors.push(err.message + '\n' + (err.stack || ''));
  });
  await page.goto('http://localhost:3000/?nocache=' + Date.now(), {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);

  console.log('=== PAGE ERRORS ===');
  errors.forEach((e, i) => {
    console.log(`\n[${i}] ${e}`);
  });
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMsgs.forEach((m) => {
    if (m.type === 'error' || m.type === 'warning') {
      console.log(`[${m.type}] ${m.text}`);
    }
  });
  await browser.close();
})();