import type { CSSProperties } from 'react'
/** Slider with a filled track (progress color follows the value). */
export default function RangeInput({ min, max, value, onChange, label }: { min: number; max: number; value: number; onChange: (v: number) => void; label?: string }) {
  const fill = `${((value - min) / (max - min)) * 100}%`
  return <input type="range" min={min} max={max} value={value} aria-label={label} style={{ '--fill': fill } as CSSProperties} onChange={e => onChange(+e.target.value)} />
}
