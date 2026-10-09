/**
 * Two-layer fixed background: base + faint grid.
 * Mounted once in the root layout, behind all content.
 * - .bg-base — solid base color with one subtle purple radial behind
 *              the hero portrait area (v3 brief: one glow only).
 * - .bg-grid — 56px grid with radial mask, fades to edges.
 *
 * The previous 3-layer mesh+grid+noise composition was simplified in
 * the v3 redesign — the brief explicitly asks for a single purple
 * radial and a faint grid, nothing more.
 */
export function BackgroundLayers() {
  return (
    <>
      <div className="bg-base" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
    </>
  );
}
