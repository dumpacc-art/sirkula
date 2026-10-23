import { useEffect, useId, useRef, useState, type KeyboardEvent as KE } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import './Select.css'

export interface Opt { value: string; label: string }

/** Fully styled dropdown (replaces native <select> so the open list is also themed). */
export default function Select({ value, onChange, options, placeholder, label, className = '' }: {
  value: string; onChange: (v: string) => void; options: (Opt | string)[]; placeholder?: string; label?: string; className?: string
}) {
  const [open, setOpen] = useState(false), [hi, setHi] = useState(0), ref = useRef<HTMLDivElement>(null), uid = useId()
  const opts: Opt[] = options.map(o => typeof o === 'string' ? { value: o, label: o } : o)
  const cur = opts.find(o => o.value === value)
  useEffect(() => {
    if (!open) return
    const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f)
  }, [open])
  const pick = (v: string) => { onChange(v); setOpen(false) }
  const key = (e: KE) => {
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) { setOpen(true); setHi(Math.max(0, opts.findIndex(o => o.value === value))) } else setHi(h => Math.min(opts.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(0, h - 1)) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open) pick(opts[hi]?.value ?? value); else { setOpen(true); setHi(Math.max(0, opts.findIndex(o => o.value === value))) } }
  }
  return (
    <div className={`ui-sel ${className}`} ref={ref}>
      <button type="button" className={`ui-sel__btn${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} onKeyDown={key}
        role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={uid} aria-label={label}>
        <span className={cur ? '' : 'ph'}>{cur?.label ?? placeholder ?? ''}</span><ChevronDown size={16} />
      </button>
      {open && <ul id={uid} className="ui-sel__list" role="listbox">
        {opts.map((o, i) => <li key={o.value} role="option" aria-selected={o.value === value} className={`${o.value === value ? 'sel' : ''}${i === hi ? ' hi' : ''}`}
          onMouseEnter={() => setHi(i)} onClick={() => pick(o.value)}><span>{o.label}</span>{o.value === value && <Check size={14} />}</li>)}
      </ul>}
    </div>
  )
}
