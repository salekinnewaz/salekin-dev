import type { Metadata } from 'next';
import { isAdminConfigured } from '@/lib/security/admin-session';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Admin · sign in',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-20">
      <header className="flex flex-col gap-3">
        <span className="eyebrow">Restricted · noindex</span>
        <h1 className="heading-display heading-gradient text-4xl">
          Sign in
        </h1>
        <p className="text-fg-2">
          The admin area is gated. Enter the password to continue.
        </p>
      </header>

      {!isAdminConfigured() ? (
        <div className="glass-card p-5 text-sm">
          <p className="font-semibold text-accent">No password configured.</p>
          <p className="mt-2 text-muted">
            Set the <code className="font-mono text-fg">ADMIN_PASSWORD</code>{' '}
            environment variable to enable the gate. In development, the admin
            area is accessible without a password.
          </p>
        </div>
      ) : (
        <div className="glass-card p-6 sm:p-8">
          <LoginForm />
        </div>
      )}

      <a href="/" className="btn-outline self-start">
        ← back to site
      </a>
    </div>
  );
}