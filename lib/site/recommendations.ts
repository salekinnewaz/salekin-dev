/**
 * Recommendations data for the home page "What People Say" section.
 *
 * IMPORTANT — content integrity
 * -----------------------------
 * We will not fabricate quotes, names, titles, companies, or photos
 * here. The array below starts empty on purpose. To populate it, the
 * site owner must:
 *
 *   1. Pull real recommendation text from their LinkedIn profile
 *      (https://www.linkedin.com/in/md-salekin-newaz/) — usually by
 *      copy-paste from the browser, or by exporting the profile as
 *      a PDF and extracting the "Recommendations received" section.
 *   2. Add 1-3 entries to the RECOMMENDATIONS array below, one per
 *      real recommender. Only include recommendations that are
 *      actually published on LinkedIn and that the recommender has
 *      explicitly approved for display.
 *   3. If a profile photo is available AND the recommender has
 *      consented, set `photoUrl` to a public URL (or drop a file in
 *      /public/recommendations/ and reference it). Otherwise leave
 *      `photoUrl` null and the UI will fall back to a tasteful
 *      initials plate.
 *
 * Required permissions before publishing a recommendation
 * ------------------------------------------------------
 *   - The recommendation text must be verbatim from the source the
 *     owner controls (their LinkedIn profile).
 *   - The recommender's name, role, and company must match what's
 *     on their LinkedIn profile at the time of capture.
 *   - If using a photo, the recommender must have given explicit
 *     permission to republish it on this site.
 *
 * Shape
 * -----
 * Each entry has the following fields:
 *   - id:           stable string used as the React key
 *   - quote:        the full recommendation text (verbatim)
 *   - name:         recommender's full name
 *   - role:         their professional title at the time of writing
 *   - company:      their employer at the time of writing
 *   - photoUrl:     optional — public URL or local path under /public
 *   - linkedinUrl:  optional — link to the recommender's profile so
 *                   visitors can verify the recommendation on LinkedIn
 *   - date:         optional — "Mon YYYY" of when it was written
 *
 * The component gracefully renders zero cards when the array is
 * empty (it shows a "no recommendations added yet" placeholder
 * instead of fabricated testimonials), so the section can ship
 * independently of having real content.
 */

export type Recommendation = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  date?: string | null;
};

export const RECOMMENDATIONS: Recommendation[] = [
  // ──────────────────────────────────────────────────────────────────
  // 1. Herman Kulild Dragesund — QA expertise on Redningsselskapet
  //    (Norwegian Sea Rescue Society) + subsidiaries.
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'herman-kulild-dragesund-2025',
    quote:
      'I am pleased to recommend Md Salekin Newaz based on his work ' +
      'as the dedicated Quality Assurance (QA) engineer on two projects ' +
      'we delivered for Redningsselskapet (the Norwegian Sea Rescue ' +
      'Society) and its subsidiary, Securmark: 1. RS Sjoliv — ' +
      'web-based member portal. 2. Trygg Båt — mobile smart-boat app ' +
      'that monitors temperature, humidity, water leaks, GPS with ' +
      'geofencing, and automatic Man Over Board engine cut-off and ' +
      'distress alert.',
    name: 'Herman Kulild Dragesund',
    role: 'Senior prosjektleder / Project Manager',
    company: 'Giur',
    photoUrl: null,
    linkedinUrl: null,
    date: 'August 4, 2025',
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. Junaid Aziz — In-depth QA understanding, team player, mentor.
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'junaid-aziz-2023',
    quote:
      'MD Salekin possesses an in-depth understanding of various ' +
      'testing methodologies and a keen eye for detail, making him an ' +
      'invaluable asset to our testing team. He consistently ' +
      'demonstrated the ability to meticulously identify and report ' +
      'bugs, helping us enhance the overall user experience of our ' +
      'applications. He is an exceptional team player and ' +
      'communicator. His ability to collaborate across departments ' +
      'and convey complex technical concepts in a clear manner greatly ' +
      "facilitated our project's ...",
    name: 'Junaid Aziz',
    role:
      'Struggling With Your SQA Career? Letts Talk | Co-Founder of QA Stack | 9+yrs Diverse Exposure | SQA Mentor & Instructor || Manual & Automation || 2x ISTQB Certified || Playwright || Selenium || AI',
    company: 'QA Stack',
    photoUrl: null,
    linkedinUrl: null,
    date: 'August 29, 2023',
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. Shahriar Morshed — Ownership and onboarding speed on
  //    the Sea Life preservation project.
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'shahriar-morshed-2023',
    quote:
      'I have managed Salekin Directly on a project related to Sea ' +
      'Life preservation. Salekin onboarded very quickly and has shown ' +
      'dedication towards understanding the projects domain and ' +
      'business. He quickly added values in our team which we were ' +
      'looking at that moment. I wish him all the best in his future ' +
      'endeavors.',
    name: 'Shahriar Morshed',
    role:
      'Software Engineer | Problem Solver · Over 7 years of engineering experience, solving real life problems with C#/.NET, Python/FastAPI. Now Focused on building AI enabled systems.',
    company: 'Freelance / Contract',
    photoUrl: null,
    linkedinUrl: null,
    date: 'August 22, 2023',
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. S.B.M Reazul Karim — Collaboration + thesis partner
  //    (BSc-era Machine Learning / data mining).
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'sbm-reazul-karim-2023',
    quote:
      'I had the privilege of collaborating with Md Salekin Newaz as a ' +
      'thesis partner, and I am truly impressed by his dedication and ' +
      'expertise. Throughout our research, he consistently ' +
      'demonstrated a deep understanding of Machine learning and data ' +
      'mining and an unwavering commitment to producing high-quality ' +
      'work. Salekin contributed significantly to our thesis project ' +
      'by conducting thorough research, analyzing data meticulously. ' +
      'He possesses excellent analytical skills, critical thinking, ' +
      'which were evident i...',
    name: 'S.B.M Reazul Karim',
    role: 'Assistant Programmer at IIUC, BLET',
    company: 'IIUC, BLET',
    photoUrl: null,
    linkedinUrl: null,
    date: 'August 18, 2023',
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. Rahadur Rahman — Associate SQA Engineer managed for 6+ months.
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'rahadur-rahman-2023',
    quote:
      "I've had the pleasure of working alongside Md Salekin Newaz in " +
      'the capacity of an Associate Software Quality Assurance (SQA) ' +
      'engineer for more than six months. During this time, I have ' +
      'been consistently impressed with his technical acumen, diligent ' +
      'approach, and commitment to maintaining the highest standards ' +
      'of software quality. Md Salekin Newaz possesses a deep ' +
      'knowledge of testing methodologies and tools. His ability to ' +
      'identify, troubleshoot, and address software anomalies has been ' +
      'instrumental in ensuring the ...',
    name: 'Rahadur Rahman',
    role:
      'Sr. Software Engineer | .NET, NodeJS, Angular, ReactJS',
    company: 'BJIT',
    photoUrl: null,
    linkedinUrl: null,
    date: 'August 17, 2023',
  },
];

/**
 * The owner's LinkedIn profile URL — used as the destination of the
 * "Read All Recommendations on LinkedIn" CTA. Update this in one
 * place if the URL ever changes (the seed file in `prisma/seed.ts`
 * also stores it under `social_linkedin`; the two should agree).
 */
export const LINKEDIN_PROFILE_URL =
  'https://www.linkedin.com/in/md-salekin-newaz';

/**
 * Returns at most `limit` recommendations, preserving the array order.
 * Use this in the component so the owner can control the on-page
 * ordering (e.g. newest first) just by reordering the array.
 */
export function getRecommendations(limit = 3): Recommendation[] {
  return RECOMMENDATIONS.slice(0, limit);
}

/** Two-letter initials used in the avatar fallback plate. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
