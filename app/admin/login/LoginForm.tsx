'use client';

import { useActionState } from 'react';
import {
  adminLoginAction,
  type AdminLoginState,
} from '@/lib/actions/admin';

const INITIAL: AdminLoginState = { ok: false, error: '' };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    adminLoginAction,
    INITIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="font-mono text-xs uppercase tracking-widest text-muted"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="field-input font-mono"
        />
      </div>

      {state.ok === false && state.error ? (
        <p
          role="alert"
          className="font-mono text-sm text-[color:var(--color-danger)]"
        >
          ✗ {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="btn-primary self-start"
      >
        {isPending ? 'signing in…' : 'sign in'}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}