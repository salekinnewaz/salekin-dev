/**
 * A cheap, stable content hash.
 *
 * FNV-1a 64-bit, rendered as 16 hex characters. It is not a security
 * primitive — it only needs to be a fast, deterministic fingerprint of
 * a byte string so that:
 *
 *   • the admin upload action can hand the client a cache-busting
 *     token, and
 *   • the `/profile-image` route can serve a matching `ETag`.
 *
 * Both call sites MUST agree, or the browser re-downloads the image on
 * every page load. Hence one implementation, shared.
 */
export function hashBytes(bytes: Uint8Array): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, '0');
}
