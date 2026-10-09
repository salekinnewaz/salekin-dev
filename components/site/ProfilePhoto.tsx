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
 * Renders as a server component — any parallax is left to the
 * surrounding composition (`HeroOrbit` is the typical parent).
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

        {/* Photo, clipped to a circle. The source is `/images/profile.jpg`
            (a 400×400 portrait where the face sits in the upper-centre
            of the frame). We render it at 200×200 viewBox units — i.e.
            at its source resolution relative to the 200×200 viewBox —
            so the photo occupies the full disc. The translation moves
            the image so the face is centred in the visible circle
            (the visible area is a circle of r=93 centred at 100,100,
            with a 3px gradient ring just outside it). The default
            `xMidYMid` preserveAspectRatio would produce a tighter
            1:1 crop but would lose the shirt collar and ears. */}
        <image
          href={src}
          x="-8"
          y="-12"
          width="216"
          height="216"
          preserveAspectRatio="xMidYMid slice"
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
