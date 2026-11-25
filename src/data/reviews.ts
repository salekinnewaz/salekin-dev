/**
 * LinkedIn endorsements received.
 *
 * These quotes are verbatim from Md Salekin Newaz's public LinkedIn
 * recommendations. The first three are shown by default; the remaining
 * two are revealed by the "+ Show 2 more endorsements" toggle.
 *
 * Content integrity: names, roles, companies and dates match the source
 * LinkedIn profiles at the time of capture. Nothing here is fabricated.
 */

/** One endorsement card. */
export type Review = {
  /** Stable id — React key. */
  id: string;
  /** The recommendation text, verbatim. */
  quote: string;
  /** The recommender's full name. */
  name: string;
  /** Their professional title. */
  role: string;
  /** Their employer. */
  company: string;
  /** When the recommendation was written. */
  date: string;
};

/**
 * The three endorsements rendered in the primary 3-column grid.
 */
export const FEATURED_REVIEWS: readonly Review[] = [
  {
    id: 'herman-kulild-dragesund',
    quote:
      'I am pleased to recommend Md Salekin Newaz based on his work as the dedicated Quality Assurance (QA) engineer on two projects we delivered for Redningsselskapet (the Norwegian Sea Rescue Society) and its subsidiary, Securmark: 1. RS Sjoliv — web-based member portal. 2. Trygg Båt — mobile smart-boat app that monitors temperature, humidity, water leaks, GPS with geofencing, and automatic Man Over Board engine cut-off and distress alert.',
    name: 'Herman Kulild Dragesund',
    role: 'Senior prosjektleder / Project Manager',
    company: 'Giur',
    date: 'August 4, 2025',
  },
  {
    id: 'junaid-aziz',
    quote:
      'MD Salekin possesses an in-depth understanding of various testing methodologies and a keen eye for detail, making him an invaluable asset to our testing team. He consistently demonstrated the ability to meticulously identify and report bugs, helping us enhance the overall user experience of our applications. He is an exceptional team player and communicator. His ability to collaborate across departments and convey complex technical concepts in a clear manner greatly facilitated our project.',
    name: 'Junaid Aziz',
    role: 'Co-Founder of QA Stack · SQA Mentor & Instructor',
    company: 'QA Stack',
    date: 'August 29, 2023',
  },
  {
    id: 'shahriar-morshed',
    quote:
      'I have managed Salekin Directly on a project related to Sea Life preservation. Salekin onboarded very quickly and has shown dedication towards understanding the projects domain and business. He quickly added values in our team which we were looking at that moment. I wish him all the best in his future endeavors.',
    name: 'Shahriar Morshed',
    role: 'Software Engineer · Problem Solver',
    company: 'Freelance / Contract',
    date: 'August 22, 2023',
  },
] as const;

/**
 * The two additional endorsements revealed by the toggle. These render
 * in a 2-column row beneath the primary grid.
 */
export const ADDITIONAL_REVIEWS: readonly Review[] = [
  {
    id: 'sbm-reazul-karim',
    quote:
      'I had the privilege of collaborating with Md Salekin Newaz as a thesis partner, and I am truly impressed by his dedication and expertise. Throughout our research, he consistently demonstrated a deep understanding of Machine learning and data mining and an unwavering commitment to producing high-quality work. Salekin contributed significantly to our thesis project by conducting thorough research, analyzing data meticulously. He possesses excellent analytical skills, critical thinking, which were evident in every step of the work.',
    name: 'S.B.M Reazul Karim',
    role: 'Assistant Programmer',
    company: 'IIUC, BLET',
    date: 'August 18, 2023',
  },
  {
    id: 'rahadur-rahman',
    quote:
      "I've had the pleasure of working alongside Md Salekin Newaz in the capacity of an Associate Software Quality Assurance (SQA) engineer for more than six months. During this time, I have been consistently impressed with his technical acumen, diligent approach, and commitment to maintaining the highest standards of software quality. Md Salekin Newaz possesses a deep knowledge of testing methodologies and tools. His ability to identify, troubleshoot, and address software anomalies has been instrumental in ensuring the quality of the products we shipped.",
    name: 'Rahadur Rahman',
    role: 'Sr. Software Engineer · .NET, NodeJS, Angular, ReactJS',
    company: 'BJIT',
    date: 'August 17, 2023',
  },
] as const;

/** The owner's LinkedIn profile — the destination of the "View all" CTA. */
export const LINKEDIN_PROFILE_URL =
  'https://www.linkedin.com/in/md-salekin-newaz';

/**
 * Two-letter initials for the avatar fallback plate. Takes the first
 * letter of the first and last name.
 */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
