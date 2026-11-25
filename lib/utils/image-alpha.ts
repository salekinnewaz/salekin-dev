/**
 * Byte-level alpha detection.
 *
 * The hero renders a portrait in one of two modes:
 *
 *   • `cutout` — a transparent PNG, where the subject stands on the
 *     tilted frame and the background shows through. Rendered with
 *     `object-fit: contain`.
 *   • `photo` — an ordinary opaque image (a JPG, say), where the photo
 *     fills the tilted frame. Rendered with `object-fit: cover`.
 *
 * The mode is a property of the *bytes*, not of a user preference, so
 * it is computed once at upload time and stored. Deciding it in the
 * browser instead would mean the hero visibly reflows after first
 * paint — a layout shift, which this project cares about.
 *
 * ── Why no image library ──────────────────────────────────────────
 *
 * A PNG's colour type lives in the IHDR chunk, at a fixed offset. The
 * chunk header is 8 bytes of signature + 4 bytes of length + 4 bytes
 * of "IHDR" = 16 bytes, then 4 bytes of width and 4 bytes of height.
 * That puts the bit depth at offset 24 and the colour type at offset
 * 25. Reading five bytes is enough, and it needs no decoder.
 *
 * PNG colour types:
 *   0 = greyscale, 2 = truecolour, 3 = indexed, 4 = greyscale+alpha,
 *   6 = truecolour+alpha
 *
 * Only 4 and 6 carry an alpha channel.
 *
 * A JPEG has no alpha channel at all. A WebP *may* have one, but
 * detecting it means parsing the RIFF chunk list, and a WebP with
 * alpha rendered in `photo` mode still looks correct — it fills the
 * frame, just cropped. So WebP is reported as opaque.
 */
export function hasAlphaChannel(bytes: Uint8Array, mime: string): boolean {
  switch (mime.toLowerCase()) {
    case 'image/png':
      return pngHasAlphaChannel(bytes);
    case 'image/jpeg':
      return false;
    default:
      return false;
  }
}

/**
 * Does this PNG carry an alpha channel?
 *
 * Only the *presence* of the channel is reported, not whether it is
 * actually used. A PNG exported by a camera can have an alpha channel
 * that is 255 everywhere. The admin can override the mode in the
 * panel, which is the right place for that judgement.
 */
export function pngHasAlphaChannel(bytes: Uint8Array): boolean {
  // 8-byte signature + IHDR length/type + width/height + bit depth.
  if (bytes.length < 26) return false;
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[i] !== signature[i]) return false;
  }
  const colorType = bytes[25];
  return colorType === 4 || colorType === 6;
}
