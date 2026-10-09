import { ContactForm } from './ContactForm';

/**
 * ContactFormSection — owns the `id="contact"` anchor and renders
 * the existing form. Split out of the old ContactSection so the
 * form gets its own dedicated section (matches the v3 brief).
 */
export function ContactFormSection() {
  return (
    <section
      id="contact"
      tabIndex={-1}
      className="section-anchor relative"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4 reveal">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Contact form
          </span>
          <h2 className="heading-display heading-underline text-3xl sm:text-4xl">
            Drop a message
          </h2>
          <p className="max-w-md text-sm text-fg-2 sm:text-base text-pretty">
            A short note about what you&apos;re working on is enough. I
            read every message and reply within a day or two.
          </p>
        </div>

        <div className="reveal">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
