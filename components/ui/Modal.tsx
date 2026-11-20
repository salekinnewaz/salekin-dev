'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Modal — the shared shell for every dialog on the site.
 *
 * Universal behaviour required by Phase 6 of the refactor spec:
 *   - Closes on the Escape key.
 *   - Closes on a backdrop click.
 *   - Closes on the close button.
 *   - Locks body scroll while open.
 *   - Does not leak listeners or leave the body locked on unmount.
 *
 * Two details worth calling out:
 *
 * 1. Scroll lock. `document.body.style.overflow` is set to `hidden` on
 *    open and restored to its previous value on close. The previous
 *    value is captured rather than blindly reset to `''`, so a modal
 *    opened while the mobile nav drawer already holds the lock does not
 *    release it early.
 *
 * 2. Focus. On open the dialog receives focus so screen readers
 *    announce it, and Tab is trapped inside so the keyboard user
 *    cannot tab into the page behind the backdrop.
 */

export type ModalProps = {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal should close. */
  onClose: () => void;
  /** Accessible label for the dialog. */
  label: string;
  /** The dialog contents. */
  children: ReactNode;
  /** Extra classes on the dialog panel. */
  className?: string;
  /** Hide the default close button (used when the header supplies its own). */
  hideCloseButton?: boolean;
};

export function Modal({
  open,
  onClose,
  label,
  children,
  className = '',
  hideCloseButton = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Body scroll lock, preserving whatever the page had before.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus into the dialog on open.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  // Trap Tab inside the dialog.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ) ?? null;
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    panel.addEventListener('keydown', onKey);
    return () => panel.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative my-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-card)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] sm:my-8 ${className}`}
      >
        {hideCloseButton ? null : (
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
