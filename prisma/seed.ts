/**
 * Idempotent seed. All writes are upserts.
 * Content sourced from `data/Md_Salekin_Newaz.pdf`.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// No standalone "Projects" section in the CV — only roles. We seed an
// archive marker so any future code that calls listPublishedProjects() still
// returns a valid (empty) array.
const projects: SeedProject[] = [];

type SeedExperience = {
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  bullets: string[];
  sortOrder: number;
};

const experiences: SeedExperience[] = [
  {
    company: 'Braintree Technologies',
    role: 'Jr. Software Engineer (DSE)',
    startDate: new Date('2025-09-01T00:00:00Z'),
    endDate: null,
    description:
      'Building internal tools and dashboards for the operations team.',
    bullets: [
      'Designing and shipping production web apps end-to-end (frontend + backend).',
      'Working across the stack: TypeScript, React/Next.js, NestJS, PostgreSQL.',
      'Pairing with senior engineers on code reviews, debugging sessions, and architecture decisions.',
      'Picking up new tools and patterns fast — currently learning NestJS in production.',
    ],
    sortOrder: 1,
  },
  {
    company: 'Braintree Technologies',
    role: 'Reception & Service Operator',
    startDate: new Date('2025-01-01T00:00:00Z'),
    endDate: new Date('2025-08-31T00:00:00Z'),
    description:
      'Front-desk operations and internal-tooling support for the engineering team.',
    bullets: [
      'Managed employee and visitor check-ins, kept the front desk running smoothly.',
      'Wrote and maintained lightweight internal tools that the engineering team still uses.',
      'Got hands-on with the production environment — real users, real incidents.',
    ],
    sortOrder: 2,
  },
  {
    company: 'StackRefactor',
    role: 'Full-Stack Developer (Freelance / Inventory project)',
    startDate: new Date('2024-08-01T00:00:00Z'),
    endDate: new Date('2024-12-31T00:00:00Z'),
    description:
      'Built the Inventory module of an e-commerce platform, end to end.',
    bullets: [
      'Designed and shipped the Inventory app for an e-commerce platform.',
      'Owned the full stack: backend APIs, database schema, frontend UI.',
      'Talked to users, iterated fast, and shipped under tight deadlines.',
    ],
    sortOrder: 3,
  },
  {
    company: 'StackRefactor',
    role: 'Full-Stack Developer (Portfolio project)',
    startDate: new Date('2023-08-01T00:00:00Z'),
    endDate: new Date('2024-07-31T00:00:00Z'),
    description:
      'Shipped 24 portfolio sites for clients across design and consulting.',
    bullets: [
      'Built 24 portfolio websites from scratch — backend + frontend, every one of them.',
      'Iterated quickly with a small design team; shipped a site per week on the busy weeks.',
      'Got deep into Next.js, Tailwind, and deployment workflows.',
    ],
    sortOrder: 4,
  },
  {
    company: 'Bournemouth International',
    role: 'Teacher — Web Development',
    startDate: new Date('2022-07-01T00:00:00Z'),
    endDate: new Date('2023-07-31T00:00:00Z'),
    description:
      'Taught web development to junior students; built the course outline.',
    bullets: [
      'Taught web development to a school batch, covering HTML, CSS, JavaScript basics.',
      'Built the course outline from scratch — picked the curriculum, set the projects, ran the sessions.',
      'Made complex topics click for new engineers.',
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

const educations: SeedEducation[] = [
  {
    institution: 'Daffodil International University',
    degree: 'B.Sc. in Computer Science & Engineering',
    startYear: 2022,
    endYear: 2025,
    description: null,
    sortOrder: 1,
  },
  {
    institution: 'Govt. K. M. Hasan College, Khulna',
    degree: 'Higher Secondary Certificate (HSC) — Science',
    startYear: 2018,
    endYear: 2020,
    description: null,
    sortOrder: 2,
  },
  {
    institution: 'Noapara Model High School, Khulna',
    degree: 'Secondary School Certificate (SSC) — Science',
    startYear: 2016,
    endYear: 2018,
    description: null,
    sortOrder: 3,
  },
];

const settings: { key: string; value: string }[] = [
  // Site identity
  { key: 'site_title', value: 'Salekin Newaz' },
  { key: 'site_tagline', value: 'Web developer building clean, fast user experiences.' },
  { key: 'site_subtitle', value: 'Jr. Software Engineer @ Braintree Technologies · Open to interesting work' },
  { key: 'site_initials', value: 'SN' },
  {
    key: 'about_bio',
    value:
      "I'm Salekin — a web developer who likes building things that work well and don't get in the way. " +
      'I work across the stack: TypeScript, React/Next.js, NestJS, PostgreSQL. Currently shipping internal tools ' +
      'and dashboards at Braintree Technologies as part of their DSE program. Before this I shipped 24 portfolio ' +
      'sites, built the inventory module of an e-commerce platform, and taught web development to junior students. ' +
      "I'm looking for an environment that values clean code, fast iteration, and engineers who actually ship.",
  },
  // Contact
  { key: 'contact_email', value: 'salekinnewaz23@gmail.com' },
  { key: 'contact_phone', value: '' }, // set in /admin before going live
  { key: 'contact_location', value: 'Dhaka, Bangladesh' },
  { key: 'cv_url', value: '/Md_Salekin_Newaz.pdf' },
  // Socials
  { key: 'social_github', value: 'https://github.com/salekin' },
  { key: 'social_linkedin', value: 'https://linkedin.com/in/salekin-newaz' },
  { key: 'social_facebook', value: 'https://facebook.com/salekin.newaz' },
  { key: 'social_x', value: '' },
  // Theme
  { key: 'accent_color', value: '#a78bfa' }, // violet
  { key: 'accent_color_2', value: '#22d3ee' }, // cyan — for gradient mesh
  { key: 'default_theme', value: 'dark' },
  // Sections
  { key: 'show_hero', value: 'true' },
  { key: 'show_about', value: 'true' },
  { key: 'show_experience', value: 'true' },
  { key: 'show_skills', value: 'true' },
  { key: 'show_education', value: 'true' },
  { key: 'show_contact', value: 'true' },
  // Skills (JSON-encoded; UI groups by category)
  {
    key: 'skills',
    value: JSON.stringify({
      languages: ['TypeScript', 'JavaScript', 'C', 'C++', 'Python'],
      frameworks: ['Next.js', 'React', 'Node.js', 'NestJS', 'Express.js', 'Tailwind CSS'],
      databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'],
      tools: ['Git', 'GitHub', 'Docker', 'Vercel', 'Prisma', 'Jest'],
      soft: ['Teamwork', 'Leadership', 'Time Management', 'Adaptability', 'Quick Learner'],
    }),
  },
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