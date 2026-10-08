type InitialsAvatarProps = {
  initials: string;
  size?: number;
  className?: string;
};

/**
 * Initials-based avatar. Two stacked SVG gradients + soft glow,
 * no external image. Server-renderable.
 */
export function InitialsAvatar({
  initials,
  size = 168,
  className,
}: InitialsAvatarProps) {
  // Take first 2 visible, strip whitespace
  const text = (initials || '?').trim().slice(0, 2).toUpperCase() || '?';

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
      aria-hidden="true"
    >
      {/* Outer glow halo */}
      <div
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
          <linearGradient id="av-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent-2)" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="av-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-2)" />
          </linearGradient>
          <linearGradient id="av-text" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f4f4ee" />
          </linearGradient>
          <radialGradient id="av-highlight" cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Filled disc */}
        <circle cx="100" cy="100" r="92" fill="url(#av-bg)" />
        {/* Highlight */}
        <circle cx="100" cy="100" r="92" fill="url(#av-highlight)" />
        {/* Stroke */}
        <circle
          cx="100"
          cy="100"
          r="91"
          fill="none"
          stroke="url(#av-stroke)"
          strokeWidth="2"
          opacity="0.6"
        />
        {/* Inner ring (decorative) */}
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-display)"
          fontSize="78"
          fontWeight="700"
          letterSpacing="-2"
          fill="url(#av-text)"
          style={{ paintOrder: 'stroke' }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}