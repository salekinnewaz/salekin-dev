import { focusIcon, type FocusIconId } from '@/lib/icons';

type FocusChipProps = {
  icon: FocusIconId;
  label: string;
  /**
   * Optional extra classNames on the inner tag. Useful if a parent
   * wants to size the chip up on a particular layout.
   */
  className?: string;
};

/**
 * FocusChip — icon-prefixed variant of the existing `.tag` chip used in
 * the hero's left focus row. Renders as a single rounded surface that
 * shows the focus-area icon and its label.
 *
 * The visual styling intentionally matches the existing `.tag` (mono
 * font, 0.78rem, 999px radius, subtle hover/active scale). The icon
 * sits in a 22px accent-tinted plate at the leading edge to echo the
 * icon plates used inside the orbit cards.
 */
export function FocusChip({ icon, label, className }: FocusChipProps) {
  const Icon = focusIcon(icon);
  return (
    <span className={`tag focus-chip ${className ?? ''}`.trim()}>
      <span className="focus-chip__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="focus-chip__label">{label}</span>
    </span>
  );
}
