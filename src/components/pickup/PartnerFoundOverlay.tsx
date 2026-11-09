import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, MapPin } from 'lucide-react'
import { useT } from '../../i18n'
import CourierScene from '../tracking/CourierScene'
import './PartnerFoundOverlay.css'

/** Momen kejutan layar penuh saat mitra ditemukan. Tenang dan lambat (relaxing); ketuk di mana saja atau tekan Lanjut untuk menutup. */
export default function PartnerFoundOverlay({ found, onClose, scene = 'matched', title = 'Partner found!' }: { found: { name: string; km: number } | null; onClose: () => void; scene?: string; title?: string }) {
  const { t } = useT()
  useEffect(() => {
    if (!found) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(onClose, 7000)
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); window.clearTimeout(timer); document.body.style.overflow = prev }
  }, [found, onClose])
  return createPortal(
    <AnimatePresence>{found && (
      <motion.div className="pf" role="dialog" aria-modal="true" aria-label={t(title)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .5 } }} onClick={onClose}>
        <div className="pf__aurora" aria-hidden="true"><i /><i /><i /></div>
        {[0, 1, 2].map(i => <span key={i} className="pf__ring" style={{ animationDelay: `${i * .9}s` }} aria-hidden="true" />)}
        {Array.from({ length: 14 }, (_, i) => <span key={i} className="pf__petal" aria-hidden="true" style={{ left: `${(i * 7.3 + 4) % 100}%`, animationDelay: `${(i % 7) * .55}s`, animationDuration: `${7 + (i % 5)}s` }} />)}
        <div className="pf__body" onClick={e => e.stopPropagation()}>
          <motion.span className="pf__badge" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: .5 }}><Check size={34} strokeWidth={3} /></motion.span>
          <motion.h2 initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: .75, duration: .9, ease: [.22, 1, .36, 1] }}>{t(title)}</motion.h2>
          <motion.p className="pf__name" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: .8, ease: [.22, 1, .36, 1] }}>{found.name}{found.km > 0 && <span><MapPin size={14} />{found.km.toFixed(1)} km</span>}</motion.p>
          <motion.div className="pf__scene" initial={{ opacity: 0, y: 40, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.3, duration: 1, ease: [.22, 1, .36, 1] }}><CourierScene status={scene} /></motion.div>
          <motion.button type="button" className="pf__btn" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1, duration: .6 }} onClick={onClose}>{t('Continue')}</motion.button>
        </div>
      </motion.div>)}
    </AnimatePresence>, document.body)
}
