import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useT } from '../../i18n'
import Button from './Button'
import '../smartmatch/SuccessAnimation.css'
import './SuccessCard.css'

/**
 * Kartu sukses ringan (gaya konfirmasi Pickup): memblokir halaman dengan latar gelap tipis, tapi kartunya kecil di tengah, bukan layar penuh.
 * Animasi sengaja sedikit: kartu naik, centang tergambar, 6 percikan kecil. Enter / Esc / tombol menutup. Tanpa blur besar, tanpa loop tak berujung.
 */
export default function SuccessCard({ title, message, facts = [], actionLabel = 'Continue', onDone, children }: {
  title: string; message: string; facts?: [string, string][]; actionLabel?: string; onDone: () => void; children?: ReactNode
}) {
  const { t } = useT(); const reduce = useReducedMotion()
  const cb = useRef(onDone); cb.current = onDone
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); cb.current() } }
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [])
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 240, damping: 18 }
  return createPortal(
    <motion.div className="sca" role="dialog" aria-modal="true" aria-label={t(title)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : .2 }}>
      <motion.div className="sca__card" initial={{ scale: reduce ? 1 : .94, y: reduce ? 0 : 16 }} animate={{ scale: 1, y: 0 }} transition={spring}>
        <div className="scc__badge">
          {!reduce && Array.from({ length: 6 }, (_, i) => <i key={i} className="scc__spark" style={{ ['--a' as string]: `${i * 60}deg` }} />)}
          <motion.div className="sca__badge" initial={{ scale: reduce ? 1 : .4 }} animate={{ scale: 1 }} transition={spring}>
            <svg viewBox="0 0 64 64" aria-hidden="true"><circle className="sca__ring" cx="32" cy="32" r="30" />
              <motion.path className="sca__tick" d="M19 33 L28 42 L45 23" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={reduce ? { duration: 0 } : { duration: .45, delay: .25, ease: 'easeOut' }} /></svg>
          </motion.div>
        </div>
        <h2>{t(title)}</h2>
        <p className="sca__msg">{t(message)}</p>
        {facts.length > 0 && <dl className="sca__facts">{facts.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{t(k)}</dt><dd>{v}</dd></div>)}</dl>}
        {children}
        <Button variant="primary" size="md" onClick={() => cb.current()}>{t(actionLabel)}</Button>
      </motion.div>
    </motion.div>, document.body)
}
