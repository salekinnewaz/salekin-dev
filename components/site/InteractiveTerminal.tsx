'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CopyButton } from './CopyButton';
import { useToast } from './ToastProvider';

/**
 * InteractiveTerminal — the hero's telemetry panel.
 *
 * Two tabs (Phase 2 of the refactor spec):
 *
 *   Tab 1 "Live Runner" — a Playwright run in progress. Four realistic
 *   test gates run in sequence, a progress bar tracks the suite, and
 *   "↻ Re-run Suite" replays the whole thing and raises a Toast when it
 *   finishes.
 *
 *   Tab 2 "GitHub Summary" — the GITHUB_STEP_SUMMARY output produced by
 *   `playwright-summary-reporter`, with a copyable local re-run
 *   command.
 *
 * The terminal is decorative telemetry rather than a real process, but
 * every value shown is a truthful one: the browser names, the test
 * titles and the durations all match the real suites described in the
 * case studies.
 */

type TabId = 'runner' | 'summary';

type TestGate = {
  id: string;
  /** The test title shown in the terminal row. */
  title: string;
  /** The suite the test belongs to. */
  suite: string;
  /** How long the test takes, in seconds. */
  duration: number;
};

const TEST_GATES: readonly TestGate[] = [
  { id: 'auth', title: 'auth.spec.ts › SSO redirect & session restore', suite: 'Auth & SSO', duration: 3 },
  { id: 'booking', title: 'booking.api.spec.ts › RS Sjoliv availability', suite: 'RS Sjoliv Booking API', duration: 5 },
  { id: 'telemetry', title: 'iot.spec.ts › Trygg Båt telemetry + MOB alert', suite: 'Trygg Båt IoT Telemetry', duration: 6 },
  { id: 'checkout', title: 'checkout.load.spec.ts › k6 p95 load gate', suite: 'Checkout k6 Load Gate', duration: 4 },
] as const;

/** Per-browser results shown in the GitHub Summary tab. */
const BROWSER_ROWS = [
  { browser: 'Chromium', passed: 48, failed: 0, duration: '41s' },
  { browser: 'WebKit', passed: 48, failed: 0, duration: '53s' },
  { browser: 'Mobile Safari', passed: 32, failed: 0, duration: '38s' },
] as const;

const RUN_COMMAND = '$ npx playwright test --project=chromium,webkit';
const RERUN_COMMAND =
  '$ npx playwright test --reporter=playwright-summary-reporter';

export function InteractiveTerminal() {
  const [tab, setTab] = useState<TabId>('runner');
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [activeGate, setActiveGate] = useState<number | null>(null);
  const { toast } = useToast();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
  }, []);

  // Cancel any in-flight animation if the component unmounts.
  useEffect(() => clearTimers, [clearTimers]);

  /**
   * Replays the suite. Each gate lights up in sequence; when the last
   * one lands the terminal raises a completion Toast.
   */
  const runSuite = useCallback(() => {
    clearTimers();
    setRunning(true);
    setCompleted([]);
    setActiveGate(0);

    let delay = 0;
    TEST_GATES.forEach((gate, i) => {
      delay += gate.duration * 220;
      timers.current.push(
        setTimeout(() => {
          setActiveGate(i + 1 < TEST_GATES.length ? i + 1 : null);
          setCompleted((prev) => (prev.includes(i) ? prev : [...prev, i]));
          if (i === TEST_GATES.length - 1) {
            setRunning(false);
            toast('Suite passed — 4/4 gates green', 'success');
          }
        }, delay),
      );
    });
  }, [clearTimers, toast]);

  // Run the suite once on mount so the panel is never static on arrival.
  // The ref guard keeps this to exactly one run: `runSuite` depends on
  // `toast`, whose identity can change between renders, so depending on
  // it directly would restart the animation on every render.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runSuite();
  }, [runSuite]);

  const progress = (completed.length / TEST_GATES.length) * 100;

  return (
    <div className="gradient-border overflow-hidden">
      {/* ─── Title bar with macOS dots ─── */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-1 font-mono text-[0.68rem] text-[var(--color-muted)]">
            salekin@qa — ~/playwright
          </span>
        </div>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {running ? 'running' : 'idle'}
        </span>
      </div>

      {/* ─── Tabs ─── */}
      <div
        role="tablist"
        aria-label="Terminal views"
        className="flex items-center gap-1 border-b border-[var(--color-border)] px-2 pt-2"
      >
        {(
          [
            { id: 'runner' as const, label: 'Live Runner' },
            { id: 'summary' as const, label: 'GitHub Summary' },
          ] satisfies { id: TabId; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`terminal-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`terminal-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-2 font-mono text-[0.7rem] transition-colors ${
              tab === t.id
                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-b-2 border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg-2)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Live Runner ─── */}
      {tab === 'runner' ? (
        <div
          role="tabpanel"
          id="terminal-panel-runner"
          aria-labelledby="terminal-tab-runner"
          className="p-3.5"
        >
          <p className="font-mono text-[0.72rem] text-[var(--color-fg-2)]">
            <span className="text-[var(--color-accent)]">$</span> {RUN_COMMAND}
          </p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between font-mono text-[0.62rem] text-[var(--color-muted)]">
              <span>
                {completed.length}/{TEST_GATES.length} gates
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-2)]"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Suite progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Test rows */}
          <ul className="mt-3 flex flex-col gap-1.5">
            {TEST_GATES.map((gate, i) => {
              const done = completed.includes(i);
              const isActive = activeGate === i;
              return (
                <li
                  key={gate.id}
                  className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] px-2.5 py-2 transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.55rem] ${
                      done
                        ? 'bg-[var(--color-accent)] text-white'
                        : isActive
                          ? 'animate-pulse bg-[var(--color-accent-2)] text-white'
                          : 'border border-[var(--color-border-strong)] text-transparent'
                    }`}
                  >
                    {done ? '✓' : '·'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[0.68rem] text-[var(--color-fg)]">
                      {gate.title}
                    </span>
                    <span className="block truncate font-mono text-[0.6rem] text-[var(--color-muted)]">
                      {gate.suite}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[0.62rem] text-[var(--color-muted)]">
                    {done ? `${gate.duration}s` : isActive ? '…' : '—'}
                  </span>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={runSuite}
            disabled={running}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 font-mono text-[0.72rem] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className={running ? 'animate-spin' : undefined}
            >
              ↻
            </span>
            {running ? 'Running suite…' : '↻ Re-run Suite'}
          </button>
        </div>
      ) : null}

      {/* ─── Tab 2: GitHub Summary ─── */}
      {tab === 'summary' ? (
        <div
          role="tabpanel"
          id="terminal-panel-summary"
          aria-labelledby="terminal-tab-summary"
          className="p-3.5"
        >
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            GITHUB_STEP_SUMMARY
          </p>

          <div className="mt-2 overflow-hidden rounded-lg border border-[var(--color-border)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-2)]">
                  <th className="px-2.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                    Browser
                  </th>
                  <th className="px-2.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                    Passed
                  </th>
                  <th className="px-2.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                    Failed
                  </th>
                  <th className="px-2.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {BROWSER_ROWS.map((row) => (
                  <tr
                    key={row.browser}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="px-2.5 py-1.5 font-mono text-[0.68rem] text-[var(--color-fg)]">
                      {row.browser}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono text-[0.68rem] text-[var(--color-accent)]">
                      {row.passed}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono text-[0.68rem] text-[var(--color-muted)]">
                      {row.failed}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono text-[0.68rem] text-[var(--color-muted)]">
                      {row.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 font-mono text-[0.68rem] text-[var(--color-muted)]">
            Re-run locally:
          </p>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] px-2.5 py-2">
            <code className="min-w-0 flex-1 truncate font-mono text-[0.68rem] text-[var(--color-fg-2)]">
              {RERUN_COMMAND}
            </code>
            <CopyButton
              value={RERUN_COMMAND}
              variant="bare"
              toastMessage="Re-run command copied"
            >
              Copy
            </CopyButton>
          </div>

          <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--color-muted)]">
            Produced by{' '}
            <span className="font-mono text-[var(--color-accent)]">
              playwright-summary-reporter
            </span>{' '}
            — zero runtime dependencies.
          </p>
        </div>
      ) : null}
    </div>
  );
}
