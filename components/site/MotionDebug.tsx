'use client';

import { useEffect, useState } from 'react';

/**
 * MotionDebug — diagnostic + accessibility tool.
 *
 * Renders ONLY when the URL contains `?debug=motion` (e.g.
 * `https://salekin.dev/?debug=motion`). It is a floating chip in the
 * bottom-left that shows, at a glance:
 *
 *   - Whether the OS is reporting `prefers-reduced-motion: reduce`
 *   - The current effective override ("system" / "on" / "off")
 *   - How many CSS / Web Animations are currently active
 *   - Buttons to force motion on/off (stored in localStorage)
 *
 * The forced values inject a `<style>` tag into the document that
 * *overrides* the OS `prefers-reduced-motion` behavior:
 *   - `force=on`  → adds `:root { --motion: on }` and a style block that
 *     *removes* the `prefers-reduced-motion` blanket zero-duration
 *     rule, effectively enabling all motion.
 *   - `force=off` → adds `:root { --motion: off }` and re-applies the
 *     same blanket rule, even on systems that don't have it on.
 *
 * This is the single tool the user can use to verify whether the
 * existing motion system is actually running, and to force it on if
 * their OS is suppressing it for any reason.
 */
export function MotionDebug() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [override, setOverride] = useState<'system' | 'on' | 'off'>('system');
  const [animCount, setAnimCount] = useState(0);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  // Mount: check URL, read OS preference, read localStorage override,
  // and (if needed) inject the override <style> tag.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('debug')) return;
    // Accept ?debug=motion specifically, but also ?debug=1 for a
    // quick toggle.
    const flag = params.get('debug');
    if (flag !== 'motion' && flag !== '1') return;
    setActive(true);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReduced(mql.matches);
    sync();
    mql.addEventListener?.('change', sync);

    const stored = window.localStorage.getItem('force-motion');
    if (stored === 'on' || stored === 'off' || stored === 'system') {
      setOverride(stored);
      applyOverride(stored);
    } else {
      setOverride('system');
    }

    setViewport({ w: window.innerWidth, h: window.innerHeight });

    return () => mql.removeEventListener?.('change', sync);
  }, []);

  // Poll the active animation count + viewport size so the badge
  // shows live numbers. Cheap; only runs while the chip is mounted.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      try {
        setAnimCount(document.getAnimations?.().length ?? 0);
        setViewport({ w: window.innerWidth, h: window.innerHeight });
      } catch {
        /* document.getAnimations not supported in this browser */
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  const effectiveReduced =
    override === 'on'
      ? false
      : override === 'off'
        ? true
        : systemReduced;
  const motionOn = !effectiveReduced;

  return (
    <div
      className="motion-debug"
      role="region"
      aria-label="Motion diagnostics"
    >
      <button
        type="button"
        className="motion-debug__chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="motion-debug-panel"
      >
        <span
          aria-hidden="true"
          className={`motion-debug__dot ${motionOn ? 'is-on' : 'is-off'}`}
        />
        <span className="motion-debug__label">
          motion: {motionOn ? 'ON' : 'OFF'}
        </span>
        <span className="motion-debug__sub">
          {effectiveReduced ? 'reduced' : 'normal'} · {animCount} anim
        </span>
      </button>

      {open ? (
        <div id="motion-debug-panel" className="motion-debug__panel">
          <p className="motion-debug__title">motion diagnostics</p>

          <dl className="motion-debug__rows">
            <div>
              <dt>OS prefers-reduced-motion</dt>
              <dd>{systemReduced ? 'reduce' : 'no-preference'}</dd>
            </div>
            <div>
              <dt>Effective state</dt>
              <dd>{motionOn ? 'motion enabled' : 'motion reduced'}</dd>
            </div>
            <div>
              <dt>Override</dt>
              <dd>
                <code>{override}</code>
              </dd>
            </div>
            <div>
              <dt>Active animations</dt>
              <dd>{animCount}</dd>
            </div>
            <div>
              <dt>Viewport</dt>
              <dd>
                {viewport.w}×{viewport.h}
              </dd>
            </div>
          </dl>

          <div className="motion-debug__actions">
            <button
              type="button"
              onClick={() => setOverrideMode('on')}
              className={`motion-debug__btn ${
                override === 'on' ? 'is-active' : ''
              }`}
            >
              force ON
            </button>
            <button
              type="button"
              onClick={() => setOverrideMode('off')}
              className={`motion-debug__btn ${
                override === 'off' ? 'is-active' : ''
              }`}
            >
              force OFF
            </button>
            <button
              type="button"
              onClick={() => setOverrideMode('system')}
              className={`motion-debug__btn ${
                override === 'system' ? 'is-active' : ''
              }`}
            >
              follow OS
            </button>
          </div>

          <p className="motion-debug__hint">
            Tip: open <code>/?debug=motion</code> on any page. The
            &ldquo;force&rdquo; choice is remembered in{' '}
            <code>localStorage</code>.
          </p>
        </div>
      ) : null}
    </div>
  );

  function setOverrideMode(next: 'on' | 'off' | 'system') {
    setOverride(next);
    if (typeof window === 'undefined') return;
    if (next === 'system') {
      window.localStorage.removeItem('force-motion');
      applyOverride('system');
    } else {
      window.localStorage.setItem('force-motion', next);
      applyOverride(next);
    }
  }
}

/**
 * Apply or remove the override <style> tag.
 *
 * - "system" → remove the override; let the OS drive behavior.
 * - "on"     → inject a <style> tag that *cancels* the
 *              `prefers-reduced-motion` blanket rule. Animations
 *              run regardless of OS preference.
 * - "off"    → inject a <style> tag that *forces* the
 *              `prefers-reduced-motion` blanket rule, even on
 *              systems that don't have it on.
 *
 * We use a single tag id (`motion-debug-override`) so we can swap
 * the contents without leaking nodes.
 */
function applyOverride(mode: 'system' | 'on' | 'off') {
  if (typeof document === 'undefined') return;
  const ID = 'motion-debug-override';
  const existing = document.getElementById(ID) as HTMLStyleElement | null;
  if (mode === 'system') {
    if (existing) existing.remove();
    document.documentElement.removeAttribute('data-motion-override');
    return;
  }
  const css =
    mode === 'on'
      ? `
        /* Force motion ON — overrides OS prefers-reduced-motion. */
        :root { --motion-debug-force: on; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: revert !important;
            animation-iteration-count: revert !important;
            animation-delay: revert !important;
            animation-play-state: running !important;
            transition-duration: revert !important;
            scroll-behavior: smooth !important;
          }
          .reveal, .reveal-stagger > * {
            opacity: revert !important;
            transform: revert !important;
          }
          .bg-mesh { animation: revert !important; }
          .marquee { animation: revert !important; transform: revert !important; }
        }
      `
      : `
        /* Force motion OFF — applies the reduced-motion rule even if
           the OS is not reporting prefers-reduced-motion. */
        :root { --motion-debug-force: off; }
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          animation-delay: 0ms !important;
          animation-play-state: paused !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
        .reveal, .reveal-stagger > * {
          opacity: 1 !important;
          transform: none !important;
        }
        .bg-mesh { animation: none !important; }
        .marquee { animation: none !important; transform: none !important; }
      `;
  if (existing) {
    existing.textContent = css;
  } else {
    const style = document.createElement('style');
    style.id = ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
  document.documentElement.setAttribute(
    'data-motion-override',
    mode,
  );
}
