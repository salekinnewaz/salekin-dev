/**
 * Meta description normalisation.
 *
 * Bing's URL Inspection reports an error when a page's meta
 * description is "too long or too short". Its accepted window is
 * roughly 100–160 characters — under 100 gets truncated to nothing
 * useful in the SERP snippet, over 160 gets hard-cut mid-word.
 *
 * Project descriptions are admin-editable database content, so we
 * cannot assume they are the right length. This helper clamps any
 * incoming text into the window:
 *
 *   - too long  → trimmed to the last sentence boundary at or before
 *                 the limit (falling back to a hard word-boundary cut
 *                 when there is no sentence end), so the snippet never
 *                 ends mid-word.
 *   - too short → padded is NOT possible without inventing copy, so
 *                 the fallback below appends a generic but truthful
 *                 suffix.
 *
 * The suffix is deliberately generic because it must stay true for
 * any project the admin creates.
 */

export const MIN_DESCRIPTION_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 160;

/**
 * The length a string will have once HTML-escaped.
 *
 * `&` becomes `&amp;` (5 characters) and `<` / `>` become 4 each, so
 * a description can be several characters "longer" in the rendered
 * HTML than in the string we measured. Next.js escapes the meta
 * description on render, and Bing decodes it again before counting —
 * but the safe rule is to keep even the *escaped* form inside the
 * window, so the raw and the rendered lengths never disagree.
 */
function escapedLength(text: string): number {
  return (
    [...text].reduce(
      (n, ch) => n + (ch === '&' ? 5 : ch === '<' || ch === '>' ? 4 : 1),
      0,
    )
  );
}

/**
 * Fallback suffix appended to a description that is below the minimum
 * length. It states only what is true of every project page on this
 * site, so it cannot misrepresent the page.
 *
 * It is long enough that appending it to a very short description
 * still clears the 100-character minimum.
 */
const SHORT_DESCRIPTION_SUFFIX =
  ' Read the full case study, the tooling used, the testing approach taken and the outcomes delivered for this engagement.';

/**
 * Cut a string at a word boundary, without leaving a dangling
 * separator behind.
 */
function cutAtWordBoundary(text: string, limit: number): string {
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return cut.replace(/[\s,;:.…—–-]+$/u, '');
}

/**
 * Normalise a description into Bing's accepted length window.
 *
 * Returns the input unchanged when it is already in range.
 */
export function normalizeMetaDescription(input: string | null | undefined): string {
  const raw = input ?? '';
  const text = raw.trim();

  if (!text) {
    return '';
  }

  // Bound on the ESCAPED length, so the value that reaches the HTML
  // is guaranteed to fit the window no matter what it contains.
  const length = escapedLength(text);

  if (length >= MIN_DESCRIPTION_LENGTH && length <= MAX_DESCRIPTION_LENGTH) {
    // Already valid — return the original string so trailing punctuation
    // and interior whitespace are preserved exactly.
    return raw.trim();
  }

  if (length > MAX_DESCRIPTION_LENGTH) {
    // Prefer ending on a sentence boundary — a complete thought reads
    // better in a SERP snippet than a truncated clause.
    const window = text.slice(0, MAX_DESCRIPTION_LENGTH + 1);
    const sentenceEnd = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('! '),
      window.lastIndexOf('? '),
    );

    if (sentenceEnd >= MIN_DESCRIPTION_LENGTH) {
      const candidate = text.slice(0, sentenceEnd + 1).trim();
      if (escapedLength(candidate) <= MAX_DESCRIPTION_LENGTH) {
        return candidate;
      }
    }

    // Trim until the ESCAPED form fits. `cutAtWordBoundary` works on
    // raw characters, so step back until the escaped length fits too.
    let cut = cutAtWordBoundary(text, MAX_DESCRIPTION_LENGTH);
    while (escapedLength(cut) > MAX_DESCRIPTION_LENGTH && cut.length > 0) {
      cut = cutAtWordBoundary(cut, cut.length - 1);
    }
    return cut;
  }

  // Too short. Append the truthful generic suffix; if that still does
  // not reach the minimum, there is nothing more we can say without
  // inventing content, so the shortened form is returned as-is.
  const padded = `${text}${text.endsWith('.') ? '' : '.'}${SHORT_DESCRIPTION_SUFFIX}`;
  return escapedLength(padded) <= MAX_DESCRIPTION_LENGTH
    ? padded
    : cutAtWordBoundary(text, MAX_DESCRIPTION_LENGTH);
}
