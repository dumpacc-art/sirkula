import type { CSSProperties } from 'react'
/** Slider with a filled track (progress color follows the value). */
export default function RangeInput({ min, max, value, onChange, label, step }: { min: number; max: number; value: number; onChange: (v: number) => void; label?: string; step?: number }) {
  const fill = `${((value - min) / (max - min)) * 100}%`
  return <input type="range" min={min} max={max} step={step} value={value} aria-label={label} style={{ '--fill': fill } as CSSProperties} onChange={e => onChange(+e.target.value)} />
}
