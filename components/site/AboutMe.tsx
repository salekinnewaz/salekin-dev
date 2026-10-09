import type { SiteIdentity } from '@/lib/queries/site';

type AboutMeProps = {
  identity: SiteIdentity;
};

/**
 * AboutMe — replaces AboutSection on the home page.
 *
 *  - Eyebrow: "About me"
 *  - H2: "Quality-driven engineering, from strategy to release."
 *  - 2 paragraphs of bio (split from `aboutBio` on `\n\n`)
 *  - "More About Me" outline button → `/about`
 *  - Small "engineering workspace" illustration on the left (a
 *    simplified monitor + charts in purple/cyan, inline SVG)
 *
 * No glow, no terminal prefix. Calm and recruiter-readable.
 */
export function AboutMe({ identity }: AboutMeProps) {
  const bio = identity.aboutBio;
  const paragraphs = bio
    ? bio.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <section
      id="about"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="reveal">
          <WorkspaceIllustration />
        </div>

        <div className="flex flex-col gap-5">
          <span className="font-mono text-xs uppercase tracking-widest text-accent reveal">
            About me
          </span>
          <h2 className="heading-display heading-underline text-4xl text-fg sm:text-5xl reveal">
            Quality-driven engineering,
            <br className="hidden sm:block" /> from strategy to release.
          </h2>
          {paragraphs.length > 0 ? (
            <div
              className="flex flex-col gap-4 reveal"
              data-testid="about-bio"
            >
              {paragraphs.slice(0, 2).map((p, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-fg-2 text-pretty sm:text-lg"
                >
                  {p}
                </p>
              ))}
            </div>
          ) : null}
          <div className="reveal">
            <a href="/about" className="btn-secondary">
              More About Me
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Small inline-SVG "engineering workspace" illustration. Replaces the
 * brief's photo of someone at a multi-monitor desk with a stylized
 * version: one big monitor showing a chart, one small monitor, a
 * floating checkmark, and a few small UI cards. Purple/cyan only.
 */
function WorkspaceIllustration() {
  return (
    <svg
      viewBox="0 0 400 320"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      role="img"
      aria-label="Engineering workspace illustration"
    >
      <defs>
        <linearGradient id="wm-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="wm-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {/* Stand */}
      <rect x="170" y="240" width="60" height="6" rx="3" fill="#263244" />
      <rect x="155" y="246" width="90" height="6" rx="3" fill="#263244" />

      {/* Monitor body */}
      <rect
        x="60"
        y="60"
        width="280"
        height="180"
        rx="12"
        fill="#111827"
        stroke="#263244"
        strokeWidth="2"
      />
      {/* Screen */}
      <rect
        x="72"
        y="72"
        width="256"
        height="156"
        rx="6"
        fill="url(#wm-screen)"
      />

      {/* Top bar (window chrome) */}
      <rect x="72" y="72" width="256" height="14" rx="6" fill="#0D1220" />
      <circle cx="82" cy="79" r="2" fill="#8B5CF6" />
      <circle cx="90" cy="79" r="2" fill="#22D3EE" />
      <circle cx="98" cy="79" r="2" fill="#263244" />

      {/* Chart bars */}
      <g>
        <rect x="92" y="170" width="20" height="40" rx="3" fill="url(#wm-bar)" />
        <rect x="120" y="148" width="20" height="62" rx="3" fill="url(#wm-bar)" opacity="0.85" />
        <rect x="148" y="124" width="20" height="86" rx="3" fill="url(#wm-bar)" />
        <rect x="176" y="138" width="20" height="72" rx="3" fill="url(#wm-bar)" opacity="0.85" />
        <rect x="204" y="108" width="20" height="102" rx="3" fill="url(#wm-bar)" />
      </g>

      {/* Line trend */}
      <polyline
        points="92,140 120,128 148,118 176,124 204,108 232,98"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="232" cy="98" r="4" fill="#22D3EE" />

      {/* Floating card 1 (small monitor) */}
      <rect
        x="278"
        y="118"
        width="92"
        height="58"
        rx="8"
        fill="#0D1220"
        stroke="#263244"
        strokeWidth="1.5"
      />
      <rect x="288" y="128" width="32" height="6" rx="2" fill="#8B5CF6" opacity="0.7" />
      <rect x="288" y="142" width="48" height="4" rx="2" fill="#263244" />
      <rect x="288" y="152" width="36" height="4" rx="2" fill="#263244" />
      <rect x="288" y="162" width="44" height="4" rx="2" fill="#263244" />

      {/* Floating card 2 (checkmark) */}
      <rect
        x="20"
        y="180"
        width="56"
        height="56"
        rx="28"
        fill="#0D1220"
        stroke="#8B5CF6"
        strokeWidth="1.5"
      />
      <path
        d="M34 208l8 8 16-18"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Floating card 3 (small alert) */}
      <rect
        x="296"
        y="46"
        width="64"
        height="32"
        rx="6"
        fill="#0D1220"
        stroke="#263244"
        strokeWidth="1.5"
      />
      <circle cx="306" cy="62" r="4" fill="#22D3EE" />
      <rect x="316" y="58" width="36" height="3" rx="1.5" fill="#263244" />
      <rect x="316" y="64" width="28" height="3" rx="1.5" fill="#263244" />
    </svg>
  );
}
