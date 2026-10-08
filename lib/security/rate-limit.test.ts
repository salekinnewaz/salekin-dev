import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  __resetRateLimitBucketsForTests,
} from './rate-limit';

describe('security/rate-limit', () => {
  beforeEach(() => {
    __resetRateLimitBucketsForTests();
  });

  it('allows up to max hits within the window', () => {
    const opts = { windowMs: 60_000, max: 3 };
    expect(checkRateLimit('k', opts).ok).toBe(true);
    expect(checkRateLimit('k', opts).ok).toBe(true);
    expect(checkRateLimit('k', opts).ok).toBe(true);
  });

  it('rejects the (max+1)th hit inside the window', () => {
    const opts = { windowMs: 60_000, max: 2 };
    checkRateLimit('k', opts);
    checkRateLimit('k', opts);
    const third = checkRateLimit('k', opts);
    expect(third.ok).toBe(false);
    if (third.ok === false) {
      expect(third.retryAfterMs).toBeGreaterThan(0);
      expect(third.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it('does not share buckets across keys', () => {
    const opts = { windowMs: 60_000, max: 1 };
    expect(checkRateLimit('a', opts).ok).toBe(true);
    expect(checkRateLimit('a', opts).ok).toBe(false);
    // 'b' has its own counter
    expect(checkRateLimit('b', opts).ok).toBe(true);
  });

  it('drops hits that fall outside the window', async () => {
    vi.useFakeTimers();
    try {
      const opts = { windowMs: 100, max: 1 };
      expect(checkRateLimit('k', opts).ok).toBe(true);
      vi.advanceTimersByTime(150);
      // After the window slides forward, the old hit should be GC'd.
      expect(checkRateLimit('k', opts).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});