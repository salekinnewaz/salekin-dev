/**
 * Profile image QA.
 *
 * Drives the admin panel's Profile Image manager end to end: pick a
 * file, preview it, save it, confirm the public `/profile-image` route
 * serves the uploaded bytes, confirm the hero picks the new image up
 * with a fresh cache-busting token, confirm it survives a reload, and
 * confirm restore-default falls back to the shipped portrait.
 *
 * Run with the dev server up:  node scripts/qa-profile.mjs
 */
import { chromium } from 'playwright';
import zlib from 'node:zlib';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1200 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

const results = [];
const record = (item, pass, detail = '') => {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
};

// ── Admin page loads with the image manager ──────────────────────
await p.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

// When an admin password is configured, sign in first so the panel
// renders. Locally there is usually no password and the panel is open.
if (p.url().includes('/admin/login')) {
  const password = process.env.QA_ADMIN_PASSWORD;
  if (!password) {
    console.error(
      'The admin panel is gated but QA_ADMIN_PASSWORD was not set — ' +
        'cannot sign in to reach the panel.',
    );
    await b.close();
    process.exit(1);
  }
  await p.locator('input[type="password"]').fill(password);
  await p.locator('button[type="submit"]').click();
  await p.waitForURL((u) => !u.toString().includes('/admin/login'), {
    timeout: 15000,
  });
  await p.waitForTimeout(800);
}

record(
  'Admin panel renders the profile image section',
  (await p.getByText('Profile image', { exact: true }).count()) >= 1,
);
record(
  'Upload control is present with the right accept list',
  (await p.locator('input[type="file"][accept*="image/png"]').count()) === 1,
);
record(
  'Restore-default action is present',
  (await p.locator('button:has-text("restore default image")').count()) === 1,
);
record(
  'Reposition crop sliders are present',
  (await p.locator('input[type="range"]').count()) === 2,
);

// ── Upload a real PNG and verify it persists ─────────────────────
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHUlEQVQoU2NkYGD4z0AEYBxVSFJoMY4qJCm0GEcVAd0kAAqSBTfaAx9qAAAAAElFTkSuQmCC',
  'base64',
);
await p.locator('input[type="file"]').setInputFiles({
  name: 'portrait.png',
  mimeType: 'image/png',
  buffer: png,
});
await p.waitForTimeout(500);
record(
  'Selecting a file enables the upload button',
  await p.locator('button:has-text("upload & save")').isEnabled(),
);

await p.locator('button:has-text("upload & save")').click();
await p.waitForTimeout(2500);

const saved = await p.getByText(/profile image updated/i).count();
record('Upload saves and reports success', saved >= 1, `matches=${saved}`);

// ── The stored row now has an image ──────────────────────────────
const check = await p.evaluate(async () => {
  const r = await fetch('/profile-image', { cache: 'no-store' });
  return {
    status: r.status,
    type: r.headers.get('content-type'),
    redirected: r.redirected,
    url: r.url,
  };
});
record(
  'The public route now serves the uploaded image directly',
  check.status === 200 && check.type === 'image/png' && !check.redirected,
  JSON.stringify(check),
);

// ── The hero picks it up without a redeploy ──────────────────────
const home = await ctx.newPage();
await home.goto(BASE, { waitUntil: 'networkidle' });
await home.waitForTimeout(800);
const heroSrc = await home.locator('.hero-portrait img').getAttribute('src');
record(
  'The hero points at the managed portrait route with a version token',
  Boolean(heroSrc && heroSrc.startsWith('/profile-image?v=')),
  `src=${heroSrc}`,
);

const naturalW = await home.locator('.hero-portrait img').evaluate(
  (el) => el.naturalWidth,
);
record('The hero image actually loads (non-zero naturalWidth)', naturalW > 0, `naturalWidth=${naturalW}`);

// ── Persistence across a full reload ─────────────────────────────
await home.reload({ waitUntil: 'networkidle' });
await home.waitForTimeout(600);
const heroSrc2 = await home.locator('.hero-portrait img').getAttribute('src');
const naturalW2 = await home.locator('.hero-portrait img').evaluate(
  (el) => el.naturalWidth,
);
record(
  'The portrait survives a page reload',
  naturalW2 > 0 && heroSrc2 === heroSrc,
  `src=${heroSrc2} naturalWidth=${naturalW2}`,
);

// ── A large upload must actually reach the server ────────────────
//
// The admin panel advertises a 3 MB limit. Two separate ceilings could
// make that unreachable, and neither is visible in the UI:
//
//   1. Next.js caps a Server Action body at 1 MB by default
//      (`experimental.serverActions.bodySizeLimit`). Without a
//      deliberate override the platform rejects the request with a
//      bare 413 *before* the action runs, so the admin sees a
//      platform error rather than the app's message.
//   2. The hosting platform rejects bodies over ~4.5 MB.
//
// This uploads a ~2.5 MB PNG — comfortably inside the advertised 3 MB
// and above the 1 MB default — and asserts it is accepted. A 1 MB
// body limit fails here.
//
// The PNG is generated rather than committed: a multi-megabyte test
// fixture has no place in the repository.
{
  const big = buildLargePng(2_600_000);
  const tooBig = buildLargePng(3_400_000);

  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.locator('input[type="file"]').setInputFiles({
    name: 'large.png',
    mimeType: 'image/png',
    buffer: big,
  });
  await p.waitForTimeout(600);
  record(
    'A 2.5 MB file passes the client-side size check',
    await p.locator('button:has-text("upload & save")').isEnabled(),
    `bytes=${big.length}`,
  );

  await p.locator('button:has-text("upload & save")').click();
  await p.waitForTimeout(4000);

  const bigResult = await p.evaluate(async () => {
    const r = await fetch('/profile-image', { cache: 'no-store' });
    return {
      status: r.status,
      length: Number(r.headers.get('content-length') ?? '0'),
      type: r.headers.get('content-type'),
    };
  });
  record(
    'A 2.5 MB upload reaches the server and is stored (the 1 MB Server Action default is overridden)',
    bigResult.status === 200 && bigResult.length > 1_000_000,
    JSON.stringify(bigResult),
  );

  // An oversized file must be refused *by the app*, with a readable
  // message — not silently accepted, and not a platform error.
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.locator('input[type="file"]').setInputFiles({
    name: 'oversize.png',
    mimeType: 'image/png',
    buffer: tooBig,
  });
  await p.waitForTimeout(700);
  const oversizeMsg = await p
    .locator('p')
    .filter({ hasText: /too large/i })
    .first()
    .textContent()
    .catch(() => null);
  record(
    'An oversized file is refused with a readable message',
    Boolean(oversizeMsg && /3 MB/.test(oversizeMsg)),
    oversizeMsg?.trim() ?? 'no message',
  );
  record(
    'An oversized file leaves the upload button disabled',
    await p.locator('button:has-text("upload & save")').isDisabled(),
  );
}

// ── Restore default ──────────────────────────────────────────────
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(700);
await p.locator('button:has-text("restore default image")').click();
await p.waitForTimeout(2500);
const restored = await p.getByText(/restored the default portrait/i).count();
record('Restore-default reports success', restored >= 1, `matches=${restored}`);

const check2 = await p.evaluate(async () => {
  const r = await fetch('/profile-image', { cache: 'no-store' });
  return { status: r.status, url: r.url, redirected: r.redirected };
});
// The shipped default portrait is the cut-out PNG, not the source JPG.
// See DEFAULT_PROFILE_IMAGE in lib/constants.ts.
record(
  'After restore the route falls back to the default portrait',
  check2.redirected &&
    check2.url.endsWith('/images/profile-cutout.png'),
  JSON.stringify(check2),
);

console.log('\nCONSOLE ERRORS:', errs.length ? errs.join('\n') : 'none');
await b.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) process.exit(1);

/**
 * Build an uncompressed-but-PNG-encoded RGB image of roughly
 * `targetBytes`.
 *
 * The pixels are a deterministic gradient, which the PNG's zlib
 * compressor shrinks to a predictable size — so the caller can ask for
 * a specific byte count rather than a pixel count. The result is a
 * genuine PNG (colour type 2, no alpha), which matters because the
 * upload path sniffs the real MIME type from the leading bytes.
 */
function buildLargePng(targetBytes) {
  const width = 1600;

  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };

  // The pixels are pseudo-random noise, which zlib cannot compress —
  // so the PNG's byte count maps almost linearly onto the pixel count
  // and the row count can be computed up front instead of searched
  // for. (A smooth gradient would compress to a fraction of its size.)
  //
  // The ratio is measured rather than assumed: one row of noise
  // deflates to a predictable number of bytes, and the PNG framing
  // adds a small fixed overhead.
  const bytesPerRow = 1600 * 3 + 1;
  const probe = Buffer.alloc(bytesPerRow);
  for (let x = 0; x < width; x += 1) {
    let s = (x * 2654435761 + 7) | 0;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    probe[1 + x * 3] = s & 0xff;
    probe[2 + x * 3] = (s >>> 8) & 0xff;
    probe[3 + x * 3] = (s >>> 16) & 0xff;
  }
  const overhead = 120; // PNG signature + IHDR + IEND + chunk framing
  const rowCost = zlib.deflateSync(probe, { level: 9 }).length;
  const height = Math.max(1, Math.ceil((targetBytes - overhead) / rowCost));

  const raw = Buffer.alloc(height * bytesPerRow);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      // xorshift, so the data is deterministic and reproducible
      // across runs without being compressible.
      let s = (x * 2654435761 + y * 40503) | 0;
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      raw[offset] = s & 0xff;
      raw[offset + 1] = (s >>> 8) & 0xff;
      raw[offset + 2] = (s >>> 16) & 0xff;
      offset += 3;
    }
  }

  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head[8] = 8; // bit depth
  head[9] = 2; // colour type: truecolour (no alpha)
  head[10] = 0; // compression
  head[11] = 0; // filter
  head[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', head),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** CRC-32, as PNG chunks require. */
function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c;
    }
    return t;
  })());
  let crc = -1;
  for (let i = 0; i < buf.length; i += 1) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

