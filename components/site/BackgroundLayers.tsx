/**
 * Fixed background layers, mounted once in the root layout behind all
 * content.
 *
 * Two layers, both intentionally restrained:
 *   - `.bg-dot-matrix` — a fine architectural dot grid that fades out
 *     toward the edges.
 *   - `.bg-aurora` — one wide band of brand colour bleeding down from
 *     the top of the viewport.
 *
 * The previous design used a multi-blob mesh plus a 56px line grid.
 * Both read as busy behind dense content; the dot matrix gives the
 * same "engineering graph paper" cue at a fraction of the visual
 * weight.
 */
export function BackgroundLayers() {
  return (
    <>
      <div className="bg-dot-matrix" aria-hidden="true" />
      <div className="bg-aurora" aria-hidden="true" />
    </>
  );
}
