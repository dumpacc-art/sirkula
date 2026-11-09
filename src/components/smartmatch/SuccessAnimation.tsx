import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import './SuccessAnimation.css'

/** Time the confirmation stays on screen before redirecting to WasteTrack. */
export const SUCCESS_REDIRECT_MS = 2600

/** Confirmation after a pickup is booked. Honors prefers-reduced-motion: the check and card appear without motion. */
export default function SuccessAnimation({ orderId, partnerName, categories, onDone }: {
  orderId: string; partnerName: string; categories: string[]; onDone: () => void
}) {
  const { t } = useT()
  const reduce = useReducedMotion()
  const cb = useRef(onDone); cb.current = onDone
  useEffect(() => { const tm = setTimeout(() => cb.current(), SUCCESS_REDIRECT_MS); return () => clearTimeout(tm) }, [orderId])

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 220, damping: 17 }
  return (
    <motion.div className="sca" role="status" aria-live="polite"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.25 }}>
      <motion.div className="sca__card" initial={{ scale: reduce ? 1 : 0.92, y: reduce ? 0 : 14 }} animate={{ scale: 1, y: 0 }} transition={spring}>
        <motion.div className="sca__badge" initial={{ rotate: reduce ? 0 : -180, scale: reduce ? 1 : 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={spring}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle className="sca__ring" cx="32" cy="32" r="30" />
            <motion.path className="sca__tick" d="M19 33 L28 42 L45 23"
              initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.3, ease: 'easeOut' }} />
          </svg>
        </motion.div>
        <h2>{t('Your pickup is confirmed')}</h2>
        <p className="sca__msg">{t('{partner} is ready to collect your waste. Thank you for keeping materials in circulation.', { partner: partnerName })}</p>
        <dl className="sca__facts">
          <dt>{t('Order ID')}</dt><dd className="sca__num">{orderId}</dd>
          <dt>{t('Partner')}</dt><dd>{partnerName}</dd>
          <dt>{t('Waste categories')}</dt><dd>{categories.join(', ')}</dd>
        </dl>
        <p className="sca__redirect">{t('Redirecting to WasteTrack to follow your order…')}</p>
        <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />} onClick={() => cb.current()}>{t('Open WasteTrack now')}</Button>
      </motion.div>
    </motion.div>
  )
}
