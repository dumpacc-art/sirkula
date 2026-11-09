import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import './Toast.css'
export default function Toast() {
  const { toast } = useStore(); const { t } = useT()
  return <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>{t(toast)}</motion.div>}</AnimatePresence>
}
