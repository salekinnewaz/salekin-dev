'use client';

import { useActionState, useEffect, useRef } from 'react';
import {
  saveSettingsAction,
  type SaveSettingsState,
} from '@/lib/actions/settings';

const INITIAL: SaveSettingsState = { ok: false, error: '' };

type AdminFormProps = {
  defaults: {
    identity: {
      siteTitle: string;
      siteTagline: string;
      siteSubtitle: string;
      siteInitials: string;
      aboutBio: string;
      contactEmail: string;
      contactPhone: string;
      contactLocation: string;
      cvUrl: string;
      socialGithub: string;
      socialLinkedin: string;
      socialFacebook: string;
      socialX: string;
    };
    sections: {
      showHero: boolean;
      showAbout: boolean;
      showExperience: boolean;
      showSkills: boolean;
      showEducation: boolean;
      showContact: boolean;
    };
    theme: {
      accentColor: string;
      accentColor2: string;
      defaultTheme: 'light' | 'dark';
    };
    skills: {
      languages: string[];
      frameworks: string[];
      databases: string[];
      tools: string[];
      soft: string[];
    };
    stats: {
      yearsCoding: number;
      sitesShipped: number;
      rolesHeld: number;
    };
  };
};

const SWATCH_PRESETS = [
  { label: 'Violet', a: '#a78bfa', b: '#22d3ee' },
  { label: 'Emerald', a: '#10b981', b: '#06b6d4' },
  { label: 'Rose', a: '#f43f5e', b: '#f59e0b' },
  { label: 'Amber', a: '#f59e0b', b: '#ef4444' },
  { label: 'Indigo', a: '#6366f1', b: '#ec4899' },
];

export function AdminForm({ defaults }: AdminFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveSettingsAction,
    INITIAL,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const wasSuccessful = useRef(false);

  useEffect(() => {
    if (state.ok === true && !wasSuccessful.current) {
      wasSuccessful.current = true;
    }
    if (state.ok === false && state.error !== '') {
      wasSuccessful.current = false;
    }
  }, [state]);

  const accentA = defaults.theme.accentColor;
  const accentB = defaults.theme.accentColor2;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-12"
    >
      {/* Identity */}
      <Section title="Identity" eyebrow="01">
        <Grid>
          <Field label="Site title" name="siteTitle" defaultValue={defaults.identity.siteTitle} required />
          <Field label="Initials (max 4)" name="siteInitials" defaultValue={defaults.identity.siteInitials} required maxLength={4} />
        </Grid>
        <Field label="Tagline" name="siteTagline" defaultValue={defaults.identity.siteTagline} required />
        <Field label="Subtitle (hero subtitle)" name="siteSubtitle" defaultValue={defaults.identity.siteSubtitle} />
        <Field
          label="About bio"
          name="aboutBio"
          defaultValue={defaults.identity.aboutBio}
          textarea
          rows={5}
        />
      </Section>

      {/* Contact */}
      <Section title="Contact" eyebrow="02">
        <Grid>
          <Field label="Email" name="contactEmail" type="email" defaultValue={defaults.identity.contactEmail} />
          <Field label="Phone" name="contactPhone" defaultValue={defaults.identity.contactPhone} />
        </Grid>
        <Grid>
          <Field label="Location" name="contactLocation" defaultValue={defaults.identity.contactLocation} />
          <Field label="CV URL (path or full link)" name="cvUrl" defaultValue={defaults.identity.cvUrl} required />
        </Grid>
      </Section>

      {/* Socials */}
      <Section title="Social links" eyebrow="03">
        <Grid>
          <Field label="GitHub" name="socialGithub" type="url" defaultValue={defaults.identity.socialGithub} placeholder="https://github.com/…" />
          <Field label="LinkedIn" name="socialLinkedin" type="url" defaultValue={defaults.identity.socialLinkedin} placeholder="https://linkedin.com/in/…" />
        </Grid>
        <Grid>
          <Field label="Facebook" name="socialFacebook" type="url" defaultValue={defaults.identity.socialFacebook} placeholder="https://facebook.com/…" />
          <Field label="X (Twitter)" name="socialX" type="url" defaultValue={defaults.identity.socialX} placeholder="https://x.com/…" />
        </Grid>
      </Section>

      {/* Sections */}
      <Section title="Section visibility" eyebrow="04">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(
            [
              ['showHero', 'Hero'],
              ['showAbout', 'About'],
              ['showExperience', 'Experience'],
              ['showSkills', 'Skills'],
              ['showEducation', 'Education'],
              ['showContact', 'Contact'],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-accent"
            >
              <input
                type="checkbox"
                name={key}
                defaultChecked={defaults.sections[key]}
                className="h-4 w-4 accent-[color:var(--color-accent)]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Theme */}
      <Section title="Theme" eyebrow="05">
        <div className="flex flex-wrap gap-2">
          {SWATCH_PRESETS.map((p) => {
            const active = p.a.toLowerCase() === accentA.toLowerCase();
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  if (!formRef.current) return;
                  const a = formRef.current.querySelector<HTMLInputElement>('input[name="accentColor"]');
                  const b = formRef.current.querySelector<HTMLInputElement>('input[name="accentColor2"]');
                  if (a) a.value = p.a;
                  if (b) b.value = p.b;
                }}
                aria-label={`Use ${p.label} preset`}
                className={
                  'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ' +
                  (active
                    ? 'border-accent text-accent'
                    : 'border-border text-muted hover:border-accent hover:text-accent')
                }
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${p.a} 0%, ${p.b} 100%)`,
                  }}
                />
                {p.label}
              </button>
            );
          })}
        </div>
        <Grid>
          <ColorField label="Accent 1" name="accentColor" defaultValue={accentA} />
          <ColorField label="Accent 2" name="accentColor2" defaultValue={accentB} />
        </Grid>
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs uppercase tracking-widest text-muted">
            Default theme
          </label>
          <select
            name="defaultTheme"
            defaultValue={defaults.theme.defaultTheme}
            className="field-input max-w-[160px]"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills" eyebrow="06">
        <p className="text-xs text-muted">
          Comma-separated lists. Each category shows up as its own card on the
          home page.
        </p>
        <SkillField label="Languages" name="languages" defaultValue={defaults.skills.languages} />
        <SkillField label="Frameworks" name="frameworks" defaultValue={defaults.skills.frameworks} />
        <SkillField label="Databases" name="databases" defaultValue={defaults.skills.databases} />
        <SkillField label="Tools" name="tools" defaultValue={defaults.skills.tools} />
        <SkillField label="Soft skills" name="soft" defaultValue={defaults.skills.soft} />
      </Section>

      {/* About-section stat counters */}
      <Section title="About stats" eyebrow="07">
        <p className="text-xs text-muted">
          Three counters in the About section. The site renders the real value
          immediately (no zero flicker) and animates the count-up on the
          client.
        </p>
        <Grid>
          <Field
            label="Years coding (e.g. 4)"
            name="statYearsCoding"
            type="number"
            min={0}
            max={999}
            defaultValue={String(defaults.stats.yearsCoding)}
            required
          />
          <Field
            label="Sites shipped (e.g. 24)"
            name="statSitesShipped"
            type="number"
            min={0}
            max={999}
            defaultValue={String(defaults.stats.sitesShipped)}
            required
          />
        </Grid>
        <Field
          label="Roles held (e.g. 5)"
          name="statRolesHeld"
          type="number"
          min={0}
          max={999}
          defaultValue={String(defaults.stats.rolesHeld)}
          required
        />
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-4 z-30 flex flex-col gap-3 rounded-xl border border-border bg-card/90 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {state.ok === true ? (
            <span className="text-accent">✓ Saved. Reload home to see changes.</span>
          ) : state.ok === false && state.error ? (
            <span className="text-[color:var(--color-danger)]">
              {state.error}
            </span>
          ) : (
            <span className="text-muted">Changes are saved on submit.</span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="btn-primary self-start sm:self-auto"
        >
          {isPending ? 'saving…' : 'save settings'}
        </button>
      </div>
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="heading-display text-2xl">
          <span className="text-fg">{title}</span>
        </h2>
        <span className="font-mono text-xs text-accent">{eyebrow}</span>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

type FieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
};

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  placeholder,
  textarea,
  rows = 4,
  maxLength,
  min,
  max,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className="field-input resize-y"
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          type={type}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          className="field-input"
        />
      )}
    </label>
  );
}

function ColorField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  // Normalize to #rrggbb for the color picker
  const normalized = /^#[0-9a-f]{6}$/i.test(defaultValue)
    ? defaultValue
    : '#000000';
    return (
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <input
            name={name}
            defaultValue={normalized}
            type="color"
            className="h-10 w-14 cursor-pointer rounded-md border border-border bg-card"
          />
          <input
            defaultValue={normalized}
            type="text"
            pattern="^#[0-9a-f]{6}$"
            onChange={(e) => {
              const target = e.currentTarget.previousElementSibling as HTMLInputElement | null;
              if (target && /^#[0-9a-f]{6}$/i.test(e.currentTarget.value)) {
                target.value = e.currentTarget.value;
              }
            }}
            className="field-input font-mono text-xs"
          />
        </div>
      </label>
    );
}

function SkillField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string[];
}) {
  return (
    <Field
      label={label}
      name={name}
      defaultValue={defaultValue.join(', ')}
      placeholder="e.g. TypeScript, React, Node.js"
    />
  );
}