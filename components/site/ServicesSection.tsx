'use client';

import { SectionHeader } from './SectionHeader';
import { ServiceIcon, type ServiceIconName } from './ServicesIcons';
import {
  ENGAGEMENT_MODELS,
  PROCESS_STEPS,
  SERVICE_CAPABILITIES,
  SERVICE_CAPABILITY_PILL,
  SERVICE_STAGES,
} from '@/src/data/services';
import { requestService } from '@/lib/site/service-selection';
import { DISCOVERY_CALL_URL } from '@/lib/constants';

/**
 * ServicesSection — module 01.
 *
 * The module opens with a headline and a lifecycle strip, then a
 * three-column grid of six capability cards. Each card carries its own
 * accent family (emerald → cyan → violet → blue → amber → purple) so
 * the grid reads as a spectrum rather than six identical boxes.
 *
 * Below the grid sit two dense bars — "How I Work" (the four process
 * steps) and "Ways to Collaborate" (the four engagement models) — and
 * a gradient CTA that closes the module.
 *
 * "Learn More →" on a card publishes the matching contact-pill id on
 * the shared channel and scrolls to #contact, where the contact form
 * preselects that pill.
 *
 * The closing CTA is the exception: "Book a Free Discovery Call" opens
 * the Calendly scheduler in a new tab, because a visitor who wants a
 * slot should not have to write a message to get one. The smaller
 * link beneath it still routes to the contact form for anyone who
 * would rather send their brief in writing.
 */
export function ServicesSection() {
  return (
    <section
      id="services"
      tabIndex={-1}
      className="section-anchor relative py-14 lg:py-16"
    >
      <SectionHeader
        index="01"
        name="Services"
        title="Software Quality, Development & Delivery"
        description="End-to-end support across the software lifecycle — from building and testing to ensuring a stable, high-quality release."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {SERVICE_STAGES.map((stage) => (
              <span key={stage.id} className="svc-stage">
                <span aria-hidden="true" className="svc-stage-icon">
                  <ServiceIcon name={stage.icon as ServiceIconName} />
                </span>
                {stage.label}
              </span>
            ))}
          </div>
        }
      />

      {/* ─── Capability grid ─── */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_CAPABILITIES.map((capability) => (
          <article
            key={capability.id}
            data-accent={capability.accent}
            className="svc-card flex h-full flex-col p-5"
          >
            {/* Icon tile + title */}
            <div className="flex items-start gap-3.5">
              <span className="svc-icon" aria-hidden="true">
                <ServiceIcon
                  name={(capability.icon as ServiceIconName) ?? 'stack'}
                />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[1.05rem] font-bold leading-snug tracking-tight text-[var(--color-fg)]">
                  {capability.title}
                </h3>
                <p className="mt-1.5 text-[0.83rem] leading-relaxed text-[var(--color-fg-2)]">
                  {capability.summary}
                </p>
              </div>
            </div>

            {/* Deliverables */}
            <ul className="mt-4 flex flex-col gap-2">
              {capability.deliverables.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[0.82rem] leading-snug text-[var(--color-fg-2)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.15rem] flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold"
                    style={{
                      backgroundColor: 'var(--svc-accent-soft)',
                      color: 'var(--svc-accent)',
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Pinned footer */}
            <div className="mt-5 flex items-center border-t border-[var(--color-border)] pt-4">
              <button
                type="button"
                onClick={() =>
                  requestService(
                    SERVICE_CAPABILITY_PILL[capability.id] ??
                      'general',
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3.5 py-1.5 text-[0.8rem] font-medium text-[var(--color-fg-2)] transition-colors hover:border-[var(--svc-accent)] hover:bg-[var(--svc-accent-soft)] hover:text-[var(--svc-accent)]"
              >
                Learn More <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* ─── How I Work ─── */}
      <div className="mt-8 grid grid-cols-1 gap-5 border-t border-[var(--color-border)] pt-6 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-3">
          <span className="section-index block">My Process</span>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            How I Work
          </h3>
          <p className="mt-2 text-[0.83rem] leading-relaxed text-[var(--color-muted)]">
            A practical, collaborative approach to deliver reliable and
            high-quality software.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <div key={step.id} className="svc-process">
              <span aria-hidden="true">
                <ServiceIcon name={step.icon as ServiceIconName} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.88rem] font-bold leading-tight text-[var(--color-fg)]">
                  <span className="text-[var(--color-accent)]">
                    {step.number}
                  </span>{' '}
                  {step.title}
                </p>
                <p className="mt-1 text-[0.76rem] leading-snug text-[var(--color-muted)]">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Ways to Collaborate ─── */}
      <div className="mt-8 grid grid-cols-1 gap-5 border-t border-[var(--color-border)] pt-6 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-3">
          <span className="section-index block">Engagement Models</span>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            Ways to Collaborate
          </h3>
          <p className="mt-2 text-[0.83rem] leading-relaxed text-[var(--color-muted)]">
            Flexible options to fit your product stage, team setup, and
            business goals.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
          {ENGAGEMENT_MODELS.map((model) => (
            <div key={model.id} className="svc-model">
              <span aria-hidden="true">
                <ServiceIcon name={model.icon as ServiceIconName} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.88rem] font-bold leading-tight text-[var(--color-fg)]">
                  {model.title}
                </p>
                <p className="mt-1 text-[0.76rem] leading-snug text-[var(--color-muted)]">
                  {model.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CTA banner ─── */}
      <div className="svc-cta mt-8 flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-2.5 text-[var(--color-accent)]"
          >
            <ServiceIcon name="target" />
          </span>
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-tight text-[var(--color-fg)] sm:text-[1.4rem]">
              Let&apos;s Build, Test, and Deliver Your Next Product
            </p>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-[var(--color-fg-2)]">
              From development and quality assurance to release and
              support — I can help at every stage.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2.5">
          {/*
            The primary action books a slot directly on Calendly, so a
            visitor can take a 30-minute call without having to write
            their brief out first. It opens in a new tab because
            Calendly is a hosted scheduler with its own navigation.
          */}
          <a
            href={DISCOVERY_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-3 text-[0.88rem] font-bold text-white shadow-[0_12px_30px_-14px_var(--color-accent)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
          >
            <span aria-hidden="true" className="inline-flex h-4 w-4">
              <ServiceIcon name="board" />
            </span>
            Book a Free Discovery Call{' '}
            <span aria-hidden="true">→</span>
          </a>

          {/*
            The alternative path, for visitors who would rather send
            the details in writing. It preselects the general enquiry
            pill in the contact form and scrolls there.
          */}
          <button
            type="button"
            onClick={() => requestService('general')}
            className="inline-flex w-fit items-center gap-1.5 text-[0.8rem] font-medium text-[var(--color-fg-2)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
          >
            or send a message instead
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
