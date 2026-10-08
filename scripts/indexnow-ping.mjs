#!/usr/bin/env node
// scripts/indexnow-ping.mjs
//
// Pings IndexNow (api.indexnow.org) with the sitemap URLs after every
// production build. IndexNow is supported by Bing, Yandex, and increasingly
// by Google — it's the supported no-auth replacement for the long-dead
// google.com/ping and bing.com/ping endpoints.
//
// Behavior:
//   - VERCEL=1: pings the deployed site (env.SITE_URL or
//     VERCEL_PROJECT_PRODUCTION_URL).
//   - Otherwise: no-op (local builds don't trigger remote pings).
//
// Required env:
//   INDEXNOW_KEY — the 32-char hex key. The same key must be served at
//                  ${host}/${INDEXNOW_KEY}.txt (already done via
//                  public/${INDEXNOW_KEY}.txt).
//
// Spec: https://www.indexnow.org/key-explained

import { setTimeout as delay } from 'node:timers/promises';

const HOST = process.env.VERCEL ? 'salekin-dev.vercel.app' : null;
const BASE_URL = process.env.SITE_URL
  ?? process.env.VERCEL_PROJECT_PRODUCTION_URL
  ?? (HOST ? `https://${HOST}` : null);
const KEY = process.env.INDEXNOW_KEY;

if (!process.env.VERCEL) {
  console.log('• indexnow-ping: skipped (not a Vercel build)');
  process.exit(0);
}

if (!BASE_URL) {
  console.error('✗ indexnow-ping: no SITE_URL / VERCEL_PROJECT_PRODUCTION_URL set');
  process.exit(0); // non-fatal — deploy should not fail on a ping
}

if (!KEY) {
  console.error('✗ indexnow-ping: INDEXNOW_KEY is not set');
  process.exit(0);
}

// Hard-coded sitemap URLs. We list the highest-priority pages explicitly
// rather than fetching the sitemap so the ping is deterministic and the
// script is independent of the build's runtime.
const URL_LIST = [
  `${BASE_URL}/`,
  `${BASE_URL}/projects`,
  `${BASE_URL}/about`,
  `${BASE_URL}/#about`,
  `${BASE_URL}/#experience`,
  `${BASE_URL}/#skills`,
  `${BASE_URL}/#contact`,
];

const payload = {
  host: new URL(BASE_URL).host,
  key: KEY,
  keyLocation: `${BASE_URL}/${KEY}.txt`,
  urlList: URL_LIST,
};

async function ping() {
  console.log(`→ indexnow-ping: posting ${URL_LIST.length} URLs to api.indexnow.org`);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  // IndexNow response codes:
  //   200 — URLs received
  //   202 — URLs received, key not yet validated (will retry)
  //   400 — bad request
  //   403 — key not found at keyLocation
  //   422 — urls don't belong to host
  //   429 — too many requests
  const body = await res.text();
  if (res.ok) {
    console.log(`✓ indexnow-ping: ${res.status} ${res.statusText} — ${body || '(no body)'}`);
  } else {
    console.error(`✗ indexnow-ping: ${res.status} ${res.statusText} — ${body}`);
  }
}

// Retry up to 2 times on transient failure.
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    await ping();
    break;
  } catch (err) {
    console.error(`✗ indexnow-ping: attempt ${attempt} failed — ${err.message}`);
    if (attempt < 3) {
      await delay(2000 * attempt);
    }
  }
}
