import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Factory, Check } from 'lucide-react'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import './CompletionAnimation.css'

const DRIVE_MS = 1800

/** Shown once when an order reaches `completed`. The truck drives from the pickup point to the processing facility, then the success state appears. */
export default function CompletionAnimation({ orderId, partnerName, onView, onClose }: {
  orderId: string; partnerName: string; onView: () => void; onClose: () => void
}) {
  const { t } = useT()
  const reduce = useReducedMotion()
  const [arrived, setArrived] = useState(!!reduce)
  useEffect(() => { const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc) }, [onClose])
  // Fallback in case the animation callback does not fire (e.g. the tab was hidden in the background).
  useEffect(() => { if (reduce) return; const tm = setTimeout(() => setArrived(true), DRIVE_MS + 400); return () => clearTimeout(tm) }, [reduce])

  const drive = { duration: reduce ? 0 : DRIVE_MS / 1000, ease: [0.45, 0, 0.2, 1] as const }
  return (
    <motion.div className="cma" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.25 }}>
      <motion.div className="cma__card" role="dialog" aria-modal="true" aria-label={t('Order completed')}
        initial={{ y: reduce ? 0 : 16, scale: reduce ? 1 : 0.97 }} animate={{ y: 0, scale: 1 }} transition={{ duration: reduce ? 0 : 0.3 }}>

        <div className="cma__stage" aria-hidden="true">
          <div className="cma__track">
            <span className="cma__rail" />
            <motion.span className="cma__trail" initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: 1 }} transition={drive} />
            <motion.div className="cma__truck" initial={{ left: '0%' }} animate={{ left: '100%' }} transition={drive}
              onAnimationComplete={() => setArrived(true)}>
              <Truck />
            </motion.div>
          </div>
          <span className={`cma__fac${arrived ? ' is-hit' : ''}`}><Factory size={22} /></span>
        </div>
        <div className="cma__labels" aria-hidden="true"><span>{t('Pickup point')}</span><span>{t('Processing facility')}</span></div>

        {arrived && (
          <motion.div className="cma__result" role="status" aria-live="polite"
            initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.35 }}>
            <motion.div className="cma__badge" aria-hidden="true"
              initial={{ scale: reduce ? 1 : 0.3, rotate: reduce ? 0 : -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 14 }}>
              <Check size={52} strokeWidth={3} />
            </motion.div>
            <h2>{t('Sampah berhasil sampai ke pengolah')}</h2>
            <p className="cma__sub">{orderId} · {partnerName}</p>
            <div className="cma__actions">
              <Button onClick={onView}>{t('View receipt')}</Button>
              <Button variant="ghost" onClick={onClose}>{t('Close')}</Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

/** Flat illustration of a collection truck. Colors come from the CSS tokens. */
function Truck() {
  return (
    <svg viewBox="0 0 120 64" width="120" height="64" className="cma__svg" aria-hidden="true">
      <rect x="2" y="8" width="72" height="42" rx="4" className="cma__box" />
      <rect x="12" y="20" width="50" height="6" rx="3" className="cma__stripe" />
      <path d="M76 22 H96 L114 38 V50 H76 Z" className="cma__cab" />
      <path d="M82 26 H94 L106 37 H82 Z" className="cma__glass" />
      <circle cx="24" cy="54" r="8" className="cma__wheel" />
      <circle cx="92" cy="54" r="8" className="cma__wheel" />
    </svg>
  )
}
