'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { copyToClipboard } from '@/lib/utils/copy';
import { useToast } from './ToastProvider';

/**
 * CopyButton — a one-click copy control for CLI commands, email
 * addresses, phone numbers and code snippets.
 *
 * On success the label flips to a confirmation state and a Toast is
 * raised. On failure a different Toast tone is used so the difference
 * is obvious.
 */

export type CopyButtonProps = {
  /** The text placed on the clipboard. */
  value: string;
  /** The visible label. */
  children?: ReactNode;
  /** Toast message shown on success. */
  toastMessage?: string;
  /** Extra classes merged onto the button. */
  className?: string;
  /** Accessible name when the visible label is not descriptive. */
  ariaLabel?: string;
  /** Render the button in the compact "icon + label" style. */
  variant?: 'default' | 'compact' | 'bare';
};

export function CopyButton({
  value,
  children,
  toastMessage,
  className = '',
  ariaLabel,
  variant = 'default',
}: CopyButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      toast(toastMessage ?? 'Copied to clipboard', 'success');
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast('Could not copy — select the text manually', 'error');
    }
  }, [value, toastMessage, toast]);

  const base =
    variant === 'bare'
      ? 'inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[0.7rem] transition-colors'
      : variant === 'compact'
        ? 'inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2 py-1 font-mono text-[0.7rem] transition-colors'
        : 'inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-xs transition-colors';

  const idle = variant === 'bare' ? 'text-[var(--color-muted)]' : 'text-[var(--color-fg-2)]';
  const active = 'text-[var(--color-accent)] border-[var(--color-accent)]';

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={ariaLabel ?? 'Copy to clipboard'}
      className={`${base} ${
        copied ? active : `${idle} hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]`
      } ${className}`}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {children ?? (copied ? 'Copied' : 'Copy')}
    </button>
  );
}
