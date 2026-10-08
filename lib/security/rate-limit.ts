/**
 * Tiny in-memory token bucket / sliding window rate limiter.
 * - Single-process, so deploys that scale horizontally will need a Redis upgrade.
 * - Buckets auto-expire so the map doesn't grow unbounded.
 */

type Bucket = {
  /** Sorted timestamps of recent requests within the window. */
  hits: number[];
};

const buckets = new Map<string, Bucket>();

// Garbage-collect empty buckets every 5 minutes. Survives Next.js HMR via
// globalThis so we don't lose state on module re-evaluation in dev.
const globalForRL = globalThis as unknown as {
  __rlBuckets?: Map<string, Bucket>;
  __rlGc?: NodeJS.Timeout;
};
if (!globalForRL.__rlBuckets) globalForRL.__rlBuckets = buckets;
if (!globalForRL.__rlGc) {
  globalForRL.__rlGc = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      // Drop hits older than the longest window we'll ever use.
      const cutoff = now - 60 * 60 * 1000;
      b.hits = b.hits.filter((t) => t > cutoff);
      if (b.hits.length === 0) buckets.delete(key);
    }
  }, 5 * 60 * 1000);
  // Don't keep the process alive just for GC.
  if (typeof globalForRL.__rlGc === 'object' && globalForRL.__rlGc && 'unref' in globalForRL.__rlGc) {
    (globalForRL.__rlGc as NodeJS.Timeout).unref();
  }
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number };

export type RateLimitOptions = {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Max hits allowed per window. */
  max: number;
};

/**
 * Record a hit for the given key. Returns whether it's allowed and, if not,
 * how long to wait before retrying.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - options.windowMs;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > cutoff);
  if (bucket.hits.length >= options.max) {
    const earliest = bucket.hits[0] ?? now;
    return {
      ok: false,
      retryAfterMs: Math.max(0, earliest + options.windowMs - now),
    };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    ok: true,
    remaining: options.max - bucket.hits.length,
  };
}

/** Test-only: wipe all buckets. */
export function __resetRateLimitBucketsForTests(): void {
  buckets.clear();
}