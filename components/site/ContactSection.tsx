'use client';

import { useEffect, useMemo, useState } from 'react';
import { SectionHeader } from './SectionHeader';
import { SpotlightCard } from './SpotlightCard';
import { CopyButton } from './CopyButton';
import { CONTACT_SERVICE_PILLS, SERVICE_PILL_LABELS } from '@/src/data/services';
import { useSelectedService } from '@/lib/site/service-selection';

/**
 * ContactSection — module 06.
 *
 * A two-column consultation frame:
 *
 *   Left (5 cols)  — headline, a live Dhaka (UTC+6) clock, the 24h SLA
 *                    note, copyable Email / Phone cards and the social
 *                    buttons.
 *   Right (7 cols) — the consulting form. Its Service Selector Pills are
 *                    driven by the shared selection channel, so clicking
 *                    "Request This Service →" in the Services section
 *                    preselects the matching pill here.
 *
 * The submit handler is deliberately isolated behind `submitEnquiry`, so
 * a Formspree / Resend endpoint can be plugged in later purely through
 * the `NEXT_PUBLIC_CONTACT_ENDPOINT` environment variable — no component
 * changes required.
 */

const EMAIL = 'salekinnewaz0@gmail.com';
const PHONE = '+880 1640-8369595';
const PHONE_HREF = 'tel:+88016408369595';
const LINKEDIN = 'https://www.linkedin.com/in/md-salekin-newaz';
const GITHUB = 'https://github.com/salekin-newaz';
const NPM = 'https://www.npmjs.com/package/playwright-summary-reporter';

/** Format the current instant in Asia/Dhaka (UTC+6). */
function dhakaTime(now: Date): { time: string; date: string } {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);
  return { time, date };
}

type FormState = {
  service: string;
  name: string;
  email: string;
  company: string;
  details: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  service: '',
  name: '',
  email: '',
  company: '',
  details: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.service) errors.service = 'Pick the engagement you need.';
  if (!form.name.trim()) errors.name = 'Your name is required.';
  if (!form.email.trim()) {
    errors.email = 'A work email is required.';
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'That email address does not look right.';
  }
  if (!form.details.trim()) {
    errors.details = 'Tell me a little about the release or product.';
  }
  return errors;
}

/**
 * Isolated submit boundary. When `NEXT_PUBLIC_CONTACT_ENDPOINT` is set
 * the payload is POSTed there; otherwise the form falls back to a short
 * simulated round-trip so the confirmation state stays reachable in
 * local development.
 */
async function submitEnquiry(payload: FormState): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('The endpoint rejected the request.');
    }
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 700));
}

export function ContactSection() {
  const [selectedService, setSelectedService] = useSelectedService();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [now, setNow] = useState<Date | null>(null);

  // Live Dhaka clock. Starts on mount so the server-rendered markup and
  // the first client render agree (no hydration mismatch).
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Preselect the pill published by the Services section.
  useEffect(() => {
    if (!selectedService) return;
    setForm((f) => ({ ...f, service: selectedService }));
  }, [selectedService]);

  const clock = useMemo(() => (now ? dhakaTime(now) : null), [now]);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    try {
      await submitEnquiry(form);
      setStatus('sent');
    } catch {
      setStatus('idle');
      setErrors({ details: 'Something went wrong sending that. Email me instead.' });
    }
  }

  if (status === 'sent') {
    return (
      <section
        id="contact"
        tabIndex={-1}
        className="section-anchor relative py-14 lg:py-16"
      >
          <SectionHeader
            index="06"
            name="Start a Conversation"
            title="Message received"
            description="This is the confirmation state for the consulting form."
          />
          <SpotlightCard className="gradient-border mt-7 p-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-lg text-[var(--color-accent)]"
            >
              ✓
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-[var(--color-fg)]">
              Thanks — I&apos;ll reply within 24 hours.
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
              Your enquiry about{' '}
              <span className="text-[var(--color-accent)]">
                {SERVICE_PILL_LABELS[form.service] ?? form.service}
              </span>{' '}
              landed. If it is urgent, email{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="text-[var(--color-accent)] underline underline-offset-4"
              >
                {EMAIL}
              </a>{' '}
              directly.
            </p>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setErrors({});
                setStatus('idle');
              }}
              className="mt-5 rounded-xl border border-[var(--color-border)] px-4 py-2 text-[0.85rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Send another message
            </button>
          </SpotlightCard>
      </section>
    );
  }

  return (
    <section
      id="contact"
      tabIndex={-1}
      className="section-anchor relative py-14 lg:py-16"
    >
        <SectionHeader
          index="06"
          name="Start a Conversation"
          title="Book a consultation"
          description="Tell me what is shipping and what is breaking. I reply to every enquiry within 24 hours."
        />

        <SpotlightCard className="gradient-border mt-7 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ─── Left — 5 cols ─── */}
            <div className="flex flex-col p-5 sm:p-6 lg:col-span-5 lg:border-r lg:border-[var(--color-border)]">
              <h3 className="text-lg font-bold leading-snug tracking-tight text-[var(--color-fg)] sm:text-xl">
                A 30-minute scoping call beats a week of back-and-forth.
              </h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--color-fg-2)]">
                Send the context, the deadline and the riskiest part. You
                get a concrete plan, not a sales deck.
              </p>

              {/* Live Dhaka clock */}
              <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]"
                  />
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    Dhaka, BD · UTC+6
                  </span>
                </div>
                <p
                  className="mt-1.5 font-mono text-lg font-bold leading-none text-[var(--color-fg)]"
                  aria-live="off"
                >
                  {clock ? clock.time : '--:--:-- --'}
                </p>
                <p className="mt-1 text-[0.72rem] text-[var(--color-muted)]">
                  {clock ? clock.date : 'Local time'}
                </p>
              </div>

              <p className="mt-3 flex items-center gap-2 text-[0.78rem] text-[var(--color-muted)]">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[0.6rem] text-[var(--color-accent)]"
                >
                  ✓
                </span>
                Replies within 24 hours — Mon–Sat, 09:00–21:00 BST.
              </p>

              {/* Copyable email + phone */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3.5 py-2.5">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex min-h-8 min-w-0 items-center truncate font-mono text-[0.8rem] text-[var(--color-fg)] hover:text-[var(--color-accent)]"
                  >
                    {EMAIL}
                  </a>
                  <CopyButton
                    value={EMAIL}
                    variant="compact"
                    toastMessage="Email copied"
                  >
                    Copy
                  </CopyButton>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3.5 py-2.5">
                  <a
                    href={PHONE_HREF}
                    className="inline-flex min-h-8 min-w-0 items-center truncate font-mono text-[0.8rem] text-[var(--color-fg)] hover:text-[var(--color-accent)]"
                  >
                    {PHONE}
                  </a>
                  <CopyButton
                    value={PHONE}
                    variant="compact"
                    toastMessage="Phone number copied"
                  >
                    Copy
                  </CopyButton>
                </div>
              </div>

              {/* Social */}
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={NPM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  npm <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            {/* ─── Right — 7 cols ─── */}
            <div className="p-5 sm:p-6 lg:col-span-7">
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                {/* Service selector pills */}
                <fieldset>
                  <legend className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    Service selector
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CONTACT_SERVICE_PILLS.map((id) => {
                      const active = form.service === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => update('service', id)}
                          aria-pressed={active}
                          data-active={active || undefined}
                          className="filter-pill"
                        >
                          {SERVICE_PILL_LABELS[id] ?? id}
                        </button>
                      );
                    })}
                  </div>
                  {errors.service ? (
                    <p className="mt-1.5 font-mono text-[0.7rem] text-[var(--color-danger)]">
                      {errors.service}
                    </p>
                  ) : null}
                </fieldset>

                {/* Name + Company */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-name"
                      className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={
                        errors.name ? 'contact-name-error' : undefined
                      }
                      className="field-input"
                    />
                    {errors.name ? (
                      <p
                        id="contact-name-error"
                        className="font-mono text-[0.7rem] text-[var(--color-danger)]"
                      >
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-company"
                      className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]"
                    >
                      Company{' '}
                      <span className="normal-case tracking-normal text-[var(--color-muted)]/70">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      value={form.company}
                      onChange={(e) => update('company', e.target.value)}
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Work email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact-email"
                    className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]"
                  >
                    Work email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={
                      errors.email ? 'contact-email-error' : undefined
                    }
                    className="field-input"
                  />
                  {errors.email ? (
                    <p
                      id="contact-email-error"
                      className="font-mono text-[0.7rem] text-[var(--color-danger)]"
                    >
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                {/* Project details */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact-details"
                    className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]"
                  >
                    Project details
                  </label>
                  <textarea
                    id="contact-details"
                    name="details"
                    rows={5}
                    value={form.details}
                    onChange={(e) => update('details', e.target.value)}
                    aria-invalid={errors.details ? 'true' : 'false'}
                    aria-describedby={
                      errors.details ? 'contact-details-error' : undefined
                    }
                    className="field-input resize-y"
                  />
                  {errors.details ? (
                    <p
                      id="contact-details-error"
                      className="font-mono text-[0.7rem] text-[var(--color-danger)]"
                    >
                      {errors.details}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  aria-busy={status === 'sending'}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-[0.88rem] font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            </div>
          </div>
        </SpotlightCard>
    </section>
  );
}
