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
  // TO ADD A REAL RECOMMENDATION:
  //
  //   {
  //     id: 'rahul-ahmed-2024',
  //     quote:
  //       'Salekin is a dedicated QA engineer with strong automation ' +
  //       'skills and a great team player. He consistently delivers ' +
  //       'high-quality work and takes ownership of complex testing ' +
  //       'challenges.',
  //     name: 'Rahul Ahmed',
  //     role: 'Engineering Manager',
  //     company: 'Brain Station 23',
  //     photoUrl: null,                       // or '/recommendations/rahul.jpg'
  //     linkedinUrl: 'https://www.linkedin.com/in/rahul-ahmed',
  //     date: 'Mar 2024',
  //   },
  //
  // ──────────────────────────────────────────────────────────────────
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
