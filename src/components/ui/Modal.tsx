import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useT } from '../../i18n'
import './Modal.css'
export default function Modal({ open, title, onClose, children }: { open:boolean; title:string; onClose:()=>void; children:ReactNode }) {
  const { t } = useT()
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) }, [open, onClose])
  return <AnimatePresence>{open && (
    <motion.div className="modal__bg" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
      <motion.div className="modal" role="dialog" aria-modal="true" aria-label={title} initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:12, opacity:0 }} onClick={e => e.stopPropagation()}>
        <div className="modal__head"><h3>{title}</h3><button onClick={onClose} aria-label={t('Close')}><X size={18} /></button></div>{children}
      </motion.div></motion.div>)}</AnimatePresence>
}
