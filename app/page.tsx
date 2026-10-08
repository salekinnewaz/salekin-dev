import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries/site';
import { listExperiencesOrdered } from '@/lib/queries/experiences';
import { listEducationOrdered } from '@/lib/queries/education';
import { Hero } from '@/components/site/Hero';
import { AboutSection } from '@/components/site/AboutSection';
import { ExperienceTimeline } from '@/components/site/ExperienceTimeline';
import { SkillGrid } from '@/components/site/SkillGrid';
import { EducationList } from '@/components/site/EducationList';
import { ContactSection } from '@/components/site/ContactSection';
import { SectionDivider } from '@/components/site/SectionDivider';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Web developer shipping clean, fast user experiences. See experience, skills, and how to get in touch.',
};

export default async function HomePage() {
  const [site, experiences, education] = await Promise.all([
    getSiteSettings(),
    listExperiencesOrdered(),
    listEducationOrdered(),
  ]);

  const { identity, sections } = site;

  return (
    <div className="flex flex-col">
      {sections.showHero ? (
        <Hero identity={identity} />
      ) : null}

      {sections.showAbout ? <AboutSection identity={identity} /> : null}

      {sections.showExperience ? (
        <section
          id="experience"
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="flex flex-col gap-4 reveal">
            <SectionDivider name="experience" trailing="// git log --oneline" />
            <h2 className="heading-display text-4xl sm:text-5xl">
              <span className="font-mono text-accent-2">$</span>{' '}
              <span className="text-fg">cat ./career.log</span>
            </h2>
          </div>
          <div className="mt-10">
            <ExperienceTimeline experiences={experiences} />
          </div>
        </section>
      ) : null}

      {sections.showSkills ? (
        <section
          id="skills"
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="flex flex-col gap-4 reveal">
            <SectionDivider name="stack" trailing="// tech I reach for" />
            <h2 className="heading-display text-4xl sm:text-5xl">
              <span className="font-mono text-accent-2">$</span>{' '}
              <span className="text-fg">grep -rE</span>{' '}
              <span className="heading-gradient">&quot;tech|tool|skill&quot;</span>{' '}
              <span className="text-muted">./</span>
            </h2>
          </div>
          <div className="mt-10">
            <SkillGrid skills={site.skills} />
          </div>
        </section>
      ) : null}

      {sections.showEducation ? (
        <section
          id="education"
          className="section-anchor relative py-20 sm:py-28"
        >
          <div className="flex flex-col gap-4 reveal">
            <SectionDivider name="education" trailing="// coursework + degree" />
            <h2 className="heading-display text-4xl sm:text-5xl">
              <span className="font-mono text-accent-2">$</span>{' '}
              <span className="text-fg">man</span>{' '}
              <span className="heading-gradient">salekin</span>
            </h2>
          </div>
          <div className="mt-10">
            <EducationList education={education} />
          </div>
        </section>
      ) : null}

      {sections.showContact ? <ContactSection identity={identity} /> : null}
    </div>
  );
}