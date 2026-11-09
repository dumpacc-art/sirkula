import './FormalCheck.css'

/**
 * Formal approval mark: a square box with a crisp, upright check drawn from two straight strokes
 * (mitred join, square caps). Not a font glyph, so it looks the same on every device.
 * `checked` = approved (solid), otherwise an empty outlined box (awaiting).
 */
export default function FormalCheck({ checked, size = 24, label }: { checked: boolean; size?: number; label?: string }) {
  return (
    <span className={`fck${checked ? ' fck--on' : ''}`} style={{ width: size, height: size }} role="img" aria-label={label ?? (checked ? 'Approved' : 'Awaiting')}>
      {checked && (
        <svg viewBox="0 0 24 24" width={size * .66} height={size * .66} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
          <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" />
        </svg>
      )}
    </span>
  )
}
