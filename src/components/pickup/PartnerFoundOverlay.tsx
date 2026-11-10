import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, MapPin } from 'lucide-react'
import { useT } from '../../i18n'
import CourierScene from '../tracking/CourierScene'
import './PartnerFoundOverlay.css'

const AUTO_CLOSE_MS = 7000
const PETALS = Array.from({ length: 10 }, (_, i) => ({ left: `${(i * 9.7 + 4) % 100}%`, delay: `${(i % 5) * .7}s`, dur: `${8 + (i % 4)}s` }))

/**
 * Momen kejutan layar penuh saat mitra ditemukan / mitra baru terdaftar. Tenang dan lambat; ketuk Lanjut, Enter, Esc, atau tunggu 7 detik untuk menutup.
 * - `onClose` dipanggil sekali saat pengguna menutup (komponen induk lalu menyetel `found` ke null, dan animasi keluar berjalan).
 * - `onExitComplete` dipanggil setelah animasi keluar selesai. Lakukan navigasi / unmount induk di sini, bukan di `onClose`, supaya overlay tidak terpotong di tengah animasi.
 * Penyebab freeze sebelumnya: efek dijalankan ulang di setiap render (onClose inline), overlay ikut di-unmount bersama induknya sebelum animasi keluar selesai,
 * dan lapisan blur besar yang beranimasi membuat browser macet saat memudar. Sekarang: handler lewat ref, efek hanya bergantung pada `found`, blur diganti gradien.
 */
export default function PartnerFoundOverlay({ found, onClose, onExitComplete, scene = 'matched', title = 'Partner found!' }: {
  found: { name: string; km: number } | null; onClose: () => void; onExitComplete?: () => void; scene?: string; title?: string
}) {
  const { t } = useT(); const reduce = useReducedMotion()
  const closeRef = useRef(onClose); closeRef.current = onClose
  const open = !!found
  useEffect(() => {
    if (!open) return
    let done = false
    const close = () => { if (done) return; done = true; closeRef.current() }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close() } }
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(close, AUTO_CLOSE_MS)
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); window.clearTimeout(timer); document.body.style.overflow = '' }
  }, [open])
  const d = (s: number) => reduce ? 0 : s
  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>{found && (
      <motion.div key="pf" className="pf" role="dialog" aria-modal="true" aria-label={t(title)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: d(.35) } }} onClick={() => closeRef.current()}>
        <div className="pf__aurora" aria-hidden="true"><i /><i /><i /></div>
        {!reduce && [0, 1, 2].map(i => <span key={i} className="pf__ring" style={{ animationDelay: `${i * 1.2}s` }} aria-hidden="true" />)}
        {!reduce && PETALS.map((p, i) => <span key={i} className="pf__petal" aria-hidden="true" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }} />)}
        <div className="pf__body" onClick={e => e.stopPropagation()}>
          <motion.span className="pf__badge" initial={{ scale: reduce ? 1 : 0, rotate: reduce ? 0 : -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: d(.4) }}><Check size={34} strokeWidth={3} /></motion.span>
          <motion.h2 initial={{ opacity: 0, y: reduce ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(.6), duration: d(.8), ease: [.22, 1, .36, 1] }}>{t(title)}</motion.h2>
          <motion.p className="pf__name" initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(.85), duration: d(.7), ease: [.22, 1, .36, 1] }}>{found.name}{found.km > 0 && <span><MapPin size={14} />{found.km.toFixed(1)} km</span>}</motion.p>
          <motion.div className="pf__scene" initial={{ opacity: 0, y: reduce ? 0 : 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(1.05), duration: d(.9), ease: [.22, 1, .36, 1] }}><CourierScene status={scene} /></motion.div>
          <motion.button type="button" className="pf__btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(1.6), duration: d(.5) }} onClick={() => closeRef.current()} autoFocus>{t('Continue')}</motion.button>
        </div>
      </motion.div>)}
    </AnimatePresence>, document.body)
}
