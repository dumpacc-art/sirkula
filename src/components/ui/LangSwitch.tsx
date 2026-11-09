import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import './LangSwitch.css'

const OPTIONS = [{ value: 'English', code: 'EN', name: 'English' }, { value: 'Bahasa Indonesia', code: 'ID', name: 'Bahasa Indonesia' }] as const

/** Pemilih bahasa: tombol pill dengan menu dropdown (bukan toggle). */
export default function LangSwitch() {
  const { prefs, setPrefs } = useStore()
  const [open, setOpen] = useState(false), ref = useRef<HTMLDivElement>(null)
  const cur = OPTIONS.find(o => o.value === prefs.language) ?? OPTIONS[0]
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])
  return (
    <div className="lang" ref={ref}>
      <button type="button" className="lang__btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Globe size={16} aria-hidden="true" /><span>{cur.code}</span><ChevronDown size={14} className={open ? 'up' : ''} aria-hidden="true" />
      </button>
      <AnimatePresence>{open && (
        <motion.ul className="lang__menu" role="listbox" aria-label="Language" initial={{ opacity: 0, y: -6, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }} transition={{ duration: .16 }}>
          {OPTIONS.map(o => (
            <li key={o.code} role="option" aria-selected={o.value === cur.value}>
              <button type="button" className={o.value === cur.value ? 'on' : ''} onClick={() => { setPrefs({ language: o.value }); setOpen(false) }}>
                <b>{o.code}</b><span>{o.name}</span>{o.value === cur.value && <Check size={16} aria-hidden="true" />}
              </button>
            </li>))}
        </motion.ul>)}
      </AnimatePresence>
    </div>
  )
}
