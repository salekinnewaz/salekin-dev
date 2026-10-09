/**
 * AI-Driven QA — differentiator section.
 *
 * Per brief §9 + §10:
 *  - 6 capability tags (verified, not hype)
 *  - 1 short positioning paragraph
 *  - Small Playwright flow diagram (runner → POM → tests → CI → release)
 *
 * Calm, no glow, no terminal prefix. Plays nicely above the Core
 * Expertise section it conceptually links to.
 */

const CAPABILITIES = [
  'AI-assisted test case ideation',
  'AI-assisted root cause analysis',
  'GitHub Copilot for automation',
  'MCP server with Azure Boards',
  'Automated defect tracking',
  'Sprint reporting automation',
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
      <div className="mb-10 flex flex-col gap-3 reveal">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          AI · QA
        </span>
        <h2 className="heading-display heading-underline text-4xl sm:text-5xl">
          AI-Driven QA
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-fg-2 text-pretty sm:text-lg">
          Integrating AI into the QA lifecycle to reduce repetitive work,
          accelerate automation and improve engineering feedback loops.
        </p>
      </div>

      <ul
        aria-label="AI-driven QA capabilities"
        className="mb-10 flex flex-wrap gap-1.5 reveal-stagger"
      >
        {CAPABILITIES.map((c) => (
          <li key={c}>
            <span className="tag">{c}</span>
          </li>
        ))}
      </ul>

      <div
        aria-label="Playwright release flow"
        className="reveal rounded-2xl border border-border bg-card p-5 sm:p-7"
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
