/**
 * Idempotent seed. All writes are upserts.
 *
 * Content sourced from the brief the user provided — NOT from the
 * previous seed which encoded an incorrect identity (a different
 * person/role/company than the one actually on the CV).
 *
 * If information is missing from the brief, it is left as a
 * placeholder rather than invented.
 */
import { db as prisma } from '../lib/db';

type SeedProject = {
  slug: string;
  title: string;
  description: string;
  body: string | null;
  imageUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  featured: boolean;
  featuredOrder: number;
  publishedAt: Date | null;
};

// Three case studies.
//
// 1. RS Sjoliv — the only project named in the brief. A real
//    rideshare project delivered during the Associate Software QA
//    Engineer role at Brain Station 23 (May 2022 – Dec 2023).
//
// 2 & 3. International client projects — the brief mentions "4+
//    concurrent international projects" but does not name them. These
//    two cards are clearly marked [INTERNATIONAL CLIENT] so a
//    recruiter doesn't mistake them for finished write-ups. The
//    admin panel can rename them with real titles when those names
//    are available.
const projects: SeedProject[] = [
  {
    slug: 'rs-sjoliv',
    title: 'RS Sjoliv — Rideshare Platform',
    description:
      'End-to-end QA for a rideshare platform: web + mobile, requirement analysis through to release. Tech: Postman, Swagger, k6, JMeter, Azure DevOps, Selenium.',
    body:
      '## Overview\n\nRS Sjoliv is a rideshare platform delivered as a Brain Station 23 client engagement. QA ownership ran from requirement analysis through production release.\n\n## What I owned\n\n- Web and mobile testing across the full product surface\n- Requirement analysis, test planning, and test data preparation\n- API testing, load testing, regression and sanity testing\n- Bug reporting and backlog grooming\n- Sprint planning, sprint review, and retrospective participation\n\n## Tech\n\nPostman · Swagger · k6 · JMeter · Azure DevOps · Selenium.\n',
    imageUrl: null,
    repoUrl: null,
    liveUrl: null,
    techStack: ['Postman', 'Swagger', 'k6', 'JMeter', 'Azure DevOps', 'Selenium'],
    featured: true,
    featuredOrder: 1,
    publishedAt: new Date('2023-12-01T00:00:00Z'),
  },
  {
    slug: 'client-norway-release',
    title: '[INTERNATIONAL CLIENT] — Norway release programme',
    description:
      'QA lead for 3 production releases delivered for a Norway-based client. UAT coordination, client sign-off, release readiness, cross-functional coordination.',
    body:
      '## Overview\n\nPlaceholder case study — project name and copy to be added in the admin panel. The brief confirms 3 production releases delivered for a Norway-based client during the Senior Software QA Engineer role at Brain Station 23 (2025 – Present).\n\n## What I owned\n\n- UAT coordination\n- Client sign-off\n- Release readiness\n- Cross-functional coordination\n',
    imageUrl: null,
    repoUrl: null,
    liveUrl: null,
    techStack: ['Playwright', 'Postman', 'k6', 'Azure DevOps'],
    featured: true,
    featuredOrder: 2,
    publishedAt: new Date('2025-09-15T00:00:00Z'),
  },
  {
    slug: 'client-international',
    title: '[INTERNATIONAL CLIENT] — Multi-industry QA',
    description:
      'QA across 4+ concurrent international projects in logistics, oil & gas, IoT, e-commerce and rideshare. Add the real client + project copy in the admin panel.',
    body:
      '## Overview\n\nPlaceholder case study — name and copy to be added. The brief confirms 4+ concurrent international projects led from a senior QA role at Brain Station 23.\n\n## Industries\n\nLogistics · Oil & Gas · IoT · E-commerce · Rideshare.\n',
    imageUrl: null,
    repoUrl: null,
    liveUrl: null,
    techStack: ['Playwright', 'Postman', 'JMeter', 'AWS IoT Core'],
    featured: true,
    featuredOrder: 3,
    publishedAt: new Date('2025-08-01T00:00:00Z'),
  },
];

type SeedExperience = {
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  bullets: string[];
  sortOrder: number;
};

// Five experience rows from brief §7. All rows reflect the verified
// Brain Station 23 + SEBPO career path.
const experiences: SeedExperience[] = [
  {
    company: 'Brain Station 23',
    role: 'Senior Software QA Engineer',
    startDate: new Date('2025-01-01T00:00:00Z'),
    endDate: null,
    description:
      'Senior QA across 4+ concurrent international projects — web, mobile, API and IoT.',
    bullets: [
      'QA strategy and release readiness',
      'Playwright automation and CI/CD integration',
      'AI-driven QA: GitHub Copilot + Azure Boards MCP',
      'API and performance testing',
      'UAT, release management, mentoring, presales',
    ],
    sortOrder: 1,
  },
  {
    company: 'Brain Station 23',
    role: 'Software QA Engineer',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-12-31T00:00:00Z'),
    description:
      'Mid-level QA on web, mobile, API and IoT products across multiple client engagements.',
    bullets: [
      'Test planning, manual and automated testing',
      'API testing, performance testing, database testing',
      'IoT testing on AWS-backed device platforms',
      'UAT, client communication, product quality ownership',
      'Junior engineer mentoring',
    ],
    sortOrder: 2,
  },
  {
    company: 'Brain Station 23',
    role: 'Associate Software QA Engineer',
    startDate: new Date('2022-05-01T00:00:00Z'),
    endDate: new Date('2023-12-31T00:00:00Z'),
    description:
      'Project: RS Sjoliv (rideshare platform). Full-cycle QA from requirement analysis through release.',
    bullets: [
      'Web and mobile testing',
      'Requirement analysis, test planning, test case design',
      'API testing, load testing, regression, sanity',
      'Selenium automation, Azure DevOps',
    ],
    sortOrder: 3,
  },
  {
    company: 'Brain Station 23',
    role: 'Trainee Software QA Engineer',
    startDate: new Date('2022-01-01T00:00:00Z'),
    endDate: new Date('2022-04-30T00:00:00Z'),
    description:
      'QA trainee role — automation fundamentals, JMeter load testing, Postman API testing.',
    bullets: [
      'Requirement analysis',
      'Automation learning and implementation',
      'JMeter load testing',
      'Postman API testing',
    ],
    sortOrder: 4,
  },
  {
    company: 'SEBPO',
    role: 'Trainee QA Engineer',
    startDate: new Date('2021-11-01T00:00:00Z'),
    endDate: new Date('2021-12-31T00:00:00Z'),
    description: 'Trainee QA — cross-browser/OS testing, test data, planning.',
    bullets: [
      'Client requirement analysis',
      'Cross-browser and OS testing',
      'QA issue reporting',
      'Creative banner/ad testing',
      'Test data preparation, test planning',
    ],
    sortOrder: 5,
  },
];

type SeedEducation = {
  institution: string;
  degree: string;
  startYear: number;
  endYear: number;
  description: string | null;
  sortOrder: number;
};

// One education row from brief §15. HSC and SSC are intentionally
// dropped (not in the brief). Digital Marketing LEDP is a 1-line
// credit rendered inside the Education/Certifications section, not a
// DB row.
const educations: SeedEducation[] = [
  {
    institution: 'International Islamic University Chittagong',
    degree: 'Bachelor of Science in Computer Science & Engineering',
    startYear: 2016,
    endYear: 2020,
    description: null,
    sortOrder: 1,
  },
];

const settings: { key: string; value: string }[] = [
  // Site identity
  { key: 'site_title', value: 'Md Salekin Newaz' },
  {
    key: 'site_tagline',
    value:
      'Building quality infrastructure that enables engineering teams to release with confidence.',
  },
  {
    key: 'site_subtitle',
    value:
      'Senior Software QA Engineer @ Brain Station 23 · ISTQB® Certified',
  },
  { key: 'site_initials', value: 'SN' },
  {
    key: 'about_bio',
    value:
      "I'm a Senior Software QA Engineer and ISTQB® Certified professional specialising in test automation, quality engineering and AI-driven QA. At Brain Station 23, I work across web, mobile, API and IoT products, helping teams build reliable release processes across logistics, oil & gas, IoT, e-commerce, rideshare and digital services.\n\nI build quality infrastructure that enables engineering teams to release with confidence — Playwright frameworks, API and performance testing, CI/CD integration, UAT coordination, and AI-assisted workflows that reduce repetitive work and accelerate feedback.",
  },
  // Contact (per brief §1)
  { key: 'contact_email', value: 'salekinnewaz0@gmail.com' },
  { key: 'contact_phone', value: '+88016408369595' },
  { key: 'contact_location', value: 'Dhaka, Bangladesh' },
  { key: 'cv_url', value: '/Md_Salekin_Newaz.pdf' },
  // Socials (per brief §1)
  { key: 'social_github', value: 'https://github.com/salekin-newaz' },
  { key: 'social_linkedin', value: 'https://www.linkedin.com/in/md-salekin-newaz' },
  { key: 'social_facebook', value: '' }, // not in brief
  { key: 'social_x', value: '' }, // not in brief
  // Theme
  { key: 'accent_color', value: '#a78bfa' }, // violet
  { key: 'accent_color_2', value: '#22d3ee' }, // cyan — for gradient mesh
  { key: 'default_theme', value: 'dark' },
  // Sections — all on
  { key: 'show_hero', value: 'true' },
  { key: 'show_about', value: 'true' },
  { key: 'show_experience', value: 'true' },
  { key: 'show_skills', value: 'true' },
  { key: 'show_education', value: 'true' },
  { key: 'show_contact', value: 'true' },
  // Skills (legacy fields — the home page now renders a hardcoded
  // QA-shaped taxonomy. Kept in the DB so the admin form still
  // works. Empty by default.)
  {
    key: 'skills',
    value: JSON.stringify({
      languages: ['JavaScript', 'TypeScript'],
      frameworks: ['Playwright', 'Selenium', 'Postman', 'Swagger'],
      databases: ['SQL', 'AWS DynamoDB'],
      tools: ['k6', 'JMeter', 'Azure DevOps', 'Jira', 'TestRail', 'GitHub Actions'],
      soft: ['Test Strategy', 'Release Readiness', 'Mentoring', 'UAT'],
    }),
  },
  // Stats. Brief §6 has 4+ concurrent international projects and 5
  // roles. `years_coding` is set to 4 (Jan 2022 trainee role → 2026
  // = 4 years). `sites_shipped` is left at 0 — the previous
  // "24 portfolio sites" claim is not in the new brief and is
  // dropped from the rendered UI. `roles_held` is 5 (4 Brain Station
  // + 1 SEBPO).
  { key: 'stat_years_coding', value: '4' },
  { key: 'stat_sites_shipped', value: '0' },
  { key: 'stat_roles_held', value: '5' },
];

async function seedProjects() {
  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        body: p.body,
        imageUrl: p.imageUrl,
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        techStack: JSON.stringify(p.techStack),
        featured: p.featured,
        featuredOrder: p.featuredOrder,
        publishedAt: p.publishedAt,
      },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        body: p.body,
        imageUrl: p.imageUrl,
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        techStack: JSON.stringify(p.techStack),
        featured: p.featured,
        featuredOrder: p.featuredOrder,
        publishedAt: p.publishedAt,
      },
    });
  }
}

async function seedExperiences() {
  for (const e of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { company: e.company, role: e.role },
    });
    const data = {
      company: e.company,
      role: e.role,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
      bullets: JSON.stringify(e.bullets),
      sortOrder: e.sortOrder,
    };
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data });
    } else {
      await prisma.experience.create({ data });
    }
  }
}

async function seedEducation() {
  for (const ed of educations) {
    const existing = await prisma.education.findFirst({
      where: { institution: ed.institution, degree: ed.degree },
    });
    if (existing) {
      await prisma.education.update({
        where: { id: existing.id },
        data: {
          startYear: ed.startYear,
          endYear: ed.endYear,
          description: ed.description,
          sortOrder: ed.sortOrder,
        },
      });
    } else {
      await prisma.education.create({
        data: {
          institution: ed.institution,
          degree: ed.degree,
          startYear: ed.startYear,
          endYear: ed.endYear,
          description: ed.description,
          sortOrder: ed.sortOrder,
        },
      });
    }
  }
}

async function seedSettings() {
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
}

async function main() {
  console.log('Seeding projects...');
  await seedProjects();
  console.log('Seeding experiences...');
  await seedExperiences();
  console.log('Seeding education...');
  await seedEducation();
  console.log('Seeding settings...');
  await seedSettings();
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
