type ProfilePhotoProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

/**
 * Real-photo circular avatar. Same visual language as InitialsAvatar
 * (soft glow halo, gradient ring, decorative inner ring) so the hero
 * still reads as one composition, just with the actual face.
 *
 * Renders as a server component — the surrounding tilt/parallax lives
 * on the parent.
 */
export function ProfilePhoto({
  src,
  alt,
  size = 168,
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
      {/* Outer glow halo — matches InitialsAvatar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -size * 0.15,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 45%, transparent) 0%, transparent 65%)',
          filter: 'blur(24px)',
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
          <radialGradient id="pf-highlight" cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="pf-clip">
            <circle cx="100" cy="100" r="92" />
          </clipPath>
        </defs>

        {/* Photo, clipped to a circle */}
        <image
          href={src}
          x="0"
          y="0"
          width="200"
          height="200"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#pf-clip)"
        />
        {/* Soft top-left highlight to match the previous glassy feel */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="url(#pf-highlight)"
          clipPath="url(#pf-clip)"
          pointerEvents="none"
        />
        {/* Gradient ring */}
        <circle
          cx="100"
          cy="100"
          r="91"
          fill="none"
          stroke="url(#pf-stroke)"
          strokeWidth="2"
          opacity="0.6"
        />
        {/* Decorative inner ring */}
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
      </svg>
      {/* Accessible name is on the parent <h1>, the photo is decorative. */}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
