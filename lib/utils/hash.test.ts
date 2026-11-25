import { describe, expect, it } from 'vitest';
import { hashBytes } from './hash';

describe('hashBytes', () => {
  it('matches the known FNV-1a 64-bit vector', () => {
    // FNV-1a of the ASCII string "a" is 0xaf63dc4c8601ec8c.
    expect(hashBytes(new TextEncoder().encode('a'))).toBe('af63dc4c8601ec8c');
  });

  it('matches the known FNV-1a 64-bit vector for "foobar"', () => {
    // FNV-1a of "foobar" is 0x85944171f73967e8.
    expect(hashBytes(new TextEncoder().encode('foobar'))).toBe(
      '85944171f73967e8',
    );
  });

  it('hashes an empty buffer to the FNV-1a offset basis', () => {
    expect(hashBytes(new Uint8Array(0))).toBe('cbf29ce484222325');
  });

  it('always returns 16 hex characters', () => {
    expect(hashBytes(new Uint8Array([0]))).toMatch(/^[0-9a-f]{16}$/);
    expect(hashBytes(new Uint8Array(1000).fill(255))).toMatch(
      /^[0-9a-f]{16}$/,
    );
  });

  it('is deterministic and distinguishes different content', () => {
    const a = hashBytes(new Uint8Array([1, 2, 3]));
    const b = hashBytes(new Uint8Array([1, 2, 3]));
    const c = hashBytes(new Uint8Array([1, 2, 4]));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
