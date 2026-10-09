/**
 * AI-Driven QA — differentiator section.
 *
 * Per the v3 brief:
 *  - Eyebrow: "AI · DRIVEN QA"
 *  - H2: "Integrating AI into QA Lifecycle"
 *  - One small "robot at a desk" SVG illustration (purple/cyan)
 *    on the left
 *  - Capabilities list on the right (6 verified items)
 *  - No glow, no terminal prefix. Calm.
 */

const CAPABILITIES = [
  'AI-assisted test case ideation',
  'AI-driven root cause analysis',
  'GitHub Copilot for automation scripts',
  'MCP server integration with Azure Boards',
  'Automated defect tracking & sprint reporting',
] as const;

const FLOW = [
  { label: 'Playwright', hint: 'runner' },
  { label: 'Page Object Model', hint: 'structure' },
  { label: 'Test Suites', hint: 'coverage' },
  { label: 'GitHub Actions', hint: 'CI / CD' },
  { label: 'Release Confidence', hint: 'outcome' },
] as const;

export function AiDrivenQa() {
  return (
    <section
      id="ai-qa"
      tabIndex={-1}
      className="section-anchor relative py-20 sm:py-28"
    >
      <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between reveal">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            AI · DRIVEN QA
          </span>
          <h2 className="heading-display heading-underline mt-2 text-3xl sm:text-4xl lg:text-5xl">
            Integrating AI into QA Lifecycle
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-2 sm:text-base text-pretty">
            Using AI to reduce repetitive work, accelerate automation
            and improve engineering feedback loops.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="reveal">
          <RobotIllustration />
        </div>

        <ul
          aria-label="AI-driven QA capabilities"
          className="flex flex-col gap-3 reveal-stagger"
        >
          {CAPABILITIES.map((c) => (
            <li
              key={c}
              className="card flex items-start gap-3 p-4 sm:p-5"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </span>
              <span className="text-sm leading-relaxed text-fg-2 sm:text-base">
                {c}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-label="Playwright release flow"
        className="reveal mt-12 rounded-2xl border border-border bg-card p-5 sm:p-7"
      >
        <div className="mb-5 flex items-baseline justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Playwright · end to end
          </p>
          <p
            aria-hidden="true"
            className="hidden font-mono text-xs text-muted sm:block"
          >
            from script to shipped
          </p>
        </div>

        <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {FLOW.map((step, i) => {
            const isLast = i === FLOW.length - 1;
            return (
              <li
                key={step.label}
                className="flex flex-1 items-stretch"
              >
                <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border bg-bg/40 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[10px] uppercase tracking-widest text-muted"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-fg sm:text-base">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted">{step.hint}</p>
                </div>
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="flex shrink-0 items-center justify-center px-1 font-mono text-base text-accent sm:px-2"
                  >
                    <span className="sm:hidden" aria-hidden="true">
                      ↓
                    </span>
                    <span className="hidden sm:inline" aria-hidden="true">
                      →
                    </span>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/**
 * Small "robot at a desk" illustration. Purple/cyan only.
 * Replaces the brief's photo of a robot with a stylized inline SVG.
 */
function RobotIllustration() {
  return (
    <svg
      viewBox="0 0 360 280"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      role="img"
      aria-label="AI assistant illustration"
    >
      <defs>
        <linearGradient id="ai-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="180" cy="160" rx="160" ry="100" fill="url(#ai-glow)" />

      {/* Desk */}
      <rect x="40" y="220" width="280" height="8" rx="3" fill="#263244" />

      {/* Laptop base */}
      <rect x="80" y="218" width="160" height="6" rx="2" fill="#0D1220" stroke="#263244" />
      <rect x="100" y="158" width="120" height="62" rx="4" fill="#111827" stroke="#263244" />
      <rect x="106" y="164" width="108" height="50" rx="2" fill="#0D1220" />
      {/* Code lines on laptop */}
      <rect x="112" y="172" width="40" height="3" rx="1" fill="#8B5CF6" />
      <rect x="112" y="180" width="60" height="3" rx="1" fill="#22D3EE" opacity="0.7" />
      <rect x="120" y="188" width="46" height="3" rx="1" fill="#22D3EE" opacity="0.5" />
      <rect x="120" y="196" width="56" height="3" rx="1" fill="#8B5CF6" opacity="0.7" />
      <rect x="112" y="204" width="32" height="3" rx="1" fill="#263244" />

      {/* Robot body */}
      <rect x="240" y="120" width="80" height="100" rx="14" fill="#111827" stroke="#263244" strokeWidth="1.5" />
      {/* Head */}
      <rect x="252" y="92" width="56" height="48" rx="10" fill="#0D1220" stroke="#263244" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="270" cy="116" r="4" fill="#22D3EE" />
      <circle cx="290" cy="116" r="4" fill="#8B5CF6" />
      {/* Antenna */}
      <line x1="280" y1="92" x2="280" y2="80" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="280" cy="78" r="2.5" fill="#8B5CF6" />
      {/* Mouth */}
      <rect x="268" y="128" width="24" height="3" rx="1.5" fill="#263244" />
      {/* Body accent */}
      <rect x="252" y="148" width="56" height="3" rx="1.5" fill="#8B5CF6" opacity="0.5" />
      <rect x="252" y="158" width="40" height="3" rx="1.5" fill="#22D3EE" opacity="0.5" />
      <rect x="252" y="168" width="48" height="3" rx="1.5" fill="#8B5CF6" opacity="0.5" />
      <rect x="252" y="178" width="32" height="3" rx="1.5" fill="#22D3EE" opacity="0.5" />

      {/* Floating AI badge */}
      <rect x="248" y="56" width="40" height="22" rx="6" fill="#0D1220" stroke="#8B5CF6" strokeWidth="1.5" />
      <text
        x="268"
        y="71"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="9"
        fontWeight="700"
        fill="#8B5CF6"
      >
        AI
      </text>

      {/* Sparkles */}
      <path d="M150 80l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#22D3EE" />
      <path d="M60 120l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#8B5CF6" />
      <path d="M310 200l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#22D3EE" />
    </svg>
  );
}
