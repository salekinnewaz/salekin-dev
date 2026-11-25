import { describe, expect, it } from 'vitest';
import { hasAlphaChannel, pngHasAlphaChannel } from './image-alpha';

/** Build a PNG header with the given colour type. */
function pngHeader(colorType: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  // IHDR length (13) at 8..11, "IHDR" at 12..15 — the values do not
  // matter for the test, only the positions of bit depth and colour type.
  bytes[24] = 8; // bit depth
  bytes[25] = colorType;
  return bytes;
}

describe('pngHasAlphaChannel', () => {
  it('is true for truecolour+alpha (colour type 6)', () => {
    expect(pngHasAlphaChannel(pngHeader(6))).toBe(true);
  });

  it('is true for greyscale+alpha (colour type 4)', () => {
    expect(pngHasAlphaChannel(pngHeader(4))).toBe(true);
  });

  it('is false for truecolour (colour type 2)', () => {
    expect(pngHasAlphaChannel(pngHeader(2))).toBe(false);
  });

  it('is false for greyscale (colour type 0) and indexed (colour type 3)', () => {
    expect(pngHasAlphaChannel(pngHeader(0))).toBe(false);
    expect(pngHasAlphaChannel(pngHeader(3))).toBe(false);
  });

  it('is false for a non-PNG buffer', () => {
    expect(pngHasAlphaChannel(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      false,
    );
  });

  it('is false for a truncated buffer', () => {
    expect(pngHasAlphaChannel(new Uint8Array(10))).toBe(false);
  });
});

describe('hasAlphaChannel', () => {
  it('reads the PNG colour type from the bytes', () => {
    expect(hasAlphaChannel(pngHeader(6), 'image/png')).toBe(true);
    expect(hasAlphaChannel(pngHeader(2), 'image/png')).toBe(false);
  });

  it('reports a JPEG as opaque', () => {
    expect(
      hasAlphaChannel(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg'),
    ).toBe(false);
  });

  it('reports WebP as opaque', () => {
    expect(hasAlphaChannel(new Uint8Array(32), 'image/webp')).toBe(false);
  });

  it('ignores the MIME case', () => {
    expect(hasAlphaChannel(pngHeader(6), 'IMAGE/PNG')).toBe(true);
  });
});
