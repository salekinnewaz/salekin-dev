/**
 * Tiny class-name combiner. Filters out falsy values (false, null, undefined)
 * and joins the rest with a single space. No dependencies.
 *
 * Usage:
 *   cn('px-2 py-1', isActive && 'bg-accent', null)
 */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  let out = '';
  for (const c of classes) {
    if (typeof c === 'string' && c.length > 0) {
      if (out.length > 0) out += ' ';
      out += c;
    }
  }
  return out;
}