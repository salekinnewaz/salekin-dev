/**
 * Terminal-style section header: `// ── <name> ────────────`
 *
 * A code-comment look used in place of the gradient display heading
 * for sections that want a log/terminal feel. The trailing rule
 * extends to fill the line and fades into the background.
 *
 * Usage:
 *   <SectionDivider name="experience" />
 *   <SectionDivider name="about" trailing="// stack + background" />
 */
type SectionDividerProps = {
  /** Short identifier shown after the dashes. Rendered uppercase. */
  name: string;
  /** Optional small text shown on the right side, after the rule. */
  trailing?: string;
};

export function SectionDivider({ name, trailing }: SectionDividerProps) {
  return (
    <div className="section-divider" role="presentation">
      <span className="section-divider__name">── {name}</span>
      <span className="section-divider__rule" aria-hidden="true" />
      {trailing ? (
        <span className="font-mono text-[0.68rem] tracking-widest text-muted opacity-80">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}
