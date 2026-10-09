/**
 * One-layer fixed background: a single subtle 56px grid masked to
 * fade out at the edges. Mounted once in the root layout, behind
 * all content. Per the v3 design brief, the previous mesh + noise
 * layers are intentionally removed — the page should feel premium
 * through typography, spacing, and interaction quality, not through
 * busy background effects.
 */
export function BackgroundLayers() {
  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
    </>
  );
}