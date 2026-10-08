'use client';

import { useEffect, useRef, useTransition } from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contactSchema,
  type ContactInput,
} from '@/lib/validation/contact';
import {
  submitContactAction,
  type SubmitContactState,
} from '@/lib/actions/contact';

const INITIAL_STATE: SubmitContactState = { ok: false, error: '' };

export function ContactForm() {
  const [formState, formAction, isPending] = useActionState(
    submitContactAction,
    INITIAL_STATE,
  );

  const {
    register,
    handleSubmit: handleRHFSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '' },
  });

  const [, startTransition] = useTransition();

  const wasSuccessful = useRef(false);
  useEffect(() => {
    if (formState.ok === true && !wasSuccessful.current) {
      wasSuccessful.current = true;
      reset({ name: '', email: '', message: '' });
    }
    if (formState.ok === false && formState.error !== '') {
      wasSuccessful.current = false;
    }
  }, [formState, reset]);

  const onSubmit = handleRHFSubmit((values) => {
    const data = new FormData();
    data.set('name', values.name);
    data.set('email', values.email);
    data.set('message', values.message);
    startTransition(() => {
      formAction(data);
    });
  });

  if (formState.ok === true) {
    return (
      <div
        role="status"
        data-testid="contact-success"
        className="terminal-card p-5"
      >
        <p className="font-mono text-sm text-accent">
          <span className="text-accent">$</span> ./submit --ok
        </p>
        <h2 className="mt-3 font-mono text-lg font-semibold text-fg">
          message sent.
        </h2>
        <p className="mt-1 text-sm text-muted">
          I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  const serverError = formState.ok === false ? formState.error : '';

  return (
    <form
      id="contact-form"
      onSubmit={onSubmit}
      noValidate
      className="relative flex flex-col gap-5"
    >
      {serverError ? (
        <div
          role="alert"
          data-testid="contact-server-error"
          className="terminal-card p-3 font-mono text-sm"
          style={{ borderColor: 'var(--color-danger)' }}
        >
          <span className="text-[color:var(--color-danger)]">
            error: {serverError}
          </span>
        </div>
      ) : null}

      {/* Honeypot — hidden from humans, visible to dumb bots. CSS-off + tabindex
          -1 keeps it out of keyboard / screen-reader flows. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-name"
          className="font-mono text-xs uppercase tracking-wider text-muted"
        >
          name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          disabled={isPending}
          {...register('name')}
          className="field-input"
        />
        {errors.name ? (
          <p
            id="contact-name-error"
            data-testid="contact-name-error"
            className="font-mono text-xs text-[color:var(--color-danger)]"
          >
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-email"
          className="font-mono text-xs uppercase tracking-wider text-muted"
        >
          email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          disabled={isPending}
          {...register('email')}
          className="field-input"
        />
        {errors.email ? (
          <p
            id="contact-email-error"
            data-testid="contact-email-error"
            className="font-mono text-xs text-[color:var(--color-danger)]"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-message"
          className="font-mono text-xs uppercase tracking-wider text-muted"
        >
          message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={
            errors.message ? 'contact-message-error' : undefined
          }
          disabled={isPending}
          {...register('message')}
          className="field-input resize-y"
        />
        {errors.message ? (
          <p
            id="contact-message-error"
            data-testid="contact-message-error"
            className="font-mono text-xs text-[color:var(--color-danger)]"
          >
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="btn-primary self-start"
      >
        {isPending ? 'sending…' : 'send →'}
      </button>
    </form>
  );
}