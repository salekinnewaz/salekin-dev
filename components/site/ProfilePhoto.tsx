type ProfilePhotoProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

/**
 * Real-photo circular avatar. Pixel-accurate to the v3 brief:
 *
 *   - Default size bumped to 280px so the face reads at the brief's
 *     reference viewport.
 *   - A soft purple/cyan glow halo behind the photo (no exaggerated
 *     blur; brief calls for one subtle glow only).
 *   - A thicker (3px) gradient ring (purple → cyan) is the only
 *     accent treatment on the photo — no inner decorative ring,
 *     no highlight overlay.
 *
 * Renders as a server component — the surrounding parallax lives
 * on the parent (`HeroStage`).
 */
export function ProfilePhoto({
  src,
  alt,
  size = 280,
  className,
}: ProfilePhotoProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      {/* Outer glow halo — one soft purple/cyan glow per brief */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -size * 0.18,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 40%, transparent) 0%, color-mix(in oklab, var(--color-accent-2) 22%, transparent) 40%, transparent 70%)',
          filter: 'blur(28px)',
          opacity: 0.7,
        }}
      />
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', display: 'block' }}
      >
        <defs>
          <linearGradient id="pf-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-2)" />
          </linearGradient>
          <clipPath id="pf-clip">
            <circle cx="100" cy="100" r="93" />
          </clipPath>
        </defs>

        {/* Photo, clipped to a circle. The source is 800×800 with
            the subject's head slightly off-center; we translate by
            (-30, -8) and scale to 215 so the head sits comfortably
            inside the visible circle with breathing room. */}
        <image
          href={src}
          x="-30"
          y="-8"
          width="215"
          height="215"
          preserveAspectRatio="xMidYMid meet"
          clipPath="url(#pf-clip)"
        />
        {/* Gradient ring — the only accent treatment on the photo. */}
        <circle
          cx="100"
          cy="100"
          r="93"
          fill="none"
          stroke="url(#pf-stroke)"
          strokeWidth="3"
          opacity="0.85"
        />
      </svg>
      {/* Accessible name is on the parent <h1>; the photo is decorative. */}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
