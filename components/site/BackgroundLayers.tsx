/**
 * Three-layer fixed background: gradient mesh, subtle grid, and noise texture.
 * Mounted once in the root layout, behind all content.
 * - .bg-mesh  — drifting radial-gradient blobs in accent colors
 * - .bg-grid  — 56px grid with radial mask, fades to edges
 * - .bg-noise — fractal SVG noise, ultra-low opacity
 */
export function BackgroundLayers() {
  return (
    <>
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
    </>
  );
}