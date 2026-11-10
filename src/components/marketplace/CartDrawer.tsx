import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { rupiah } from '../../lib/pricing'
import { emojiOf } from './ProductCard'

export default function CartDrawer({ open, onClose, onOrdered }: { open: boolean; onClose: () => void; onOrdered: () => void }) {
  const { cart, products, setCartQty, removeFromCart, placeOrder } = useStore(); const { t } = useT()
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) }, [open, onClose])
  const lines = cart.map(c => ({ ...c, p: products.find(p => p.id === c.productId)! })).filter(l => l.p)
  const sub = lines.reduce((a, l) => a + l.qty * l.p.price, 0)
  return createPortal(
    <AnimatePresence>{open && (
      <motion.div className="mkd__bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.aside className="mkd" role="dialog" aria-modal="true" aria-label={t('Cart')} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: .22 }} onClick={e => e.stopPropagation()}>
          <header className="mkd__head"><h2>{t('Cart')}</h2><button type="button" onClick={onClose} aria-label={t('Close')}><X size={18} /></button></header>
          <div className="mkd__list">
            {lines.length === 0 ? <p className="mk__muted">{t('Your cart is empty.')}</p> : lines.map(l => (
              <div key={l.productId} className="mkd__line">
                <span className="mkd__em" aria-hidden="true">{emojiOf(l.p.category)}</span>
                <div className="mkd__info"><b>{t(l.p.name)}</b><small>{rupiah(l.p.price)} / {l.p.unit ?? 'pcs'}</small>
                  <div className="mkd__qty">
                    <button type="button" onClick={() => setCartQty(l.productId, l.qty - 1)} aria-label="-"><Minus size={14} /></button>
                    <span>{l.qty}</span>
                    <button type="button" onClick={() => setCartQty(l.productId, l.qty + 1)} disabled={l.qty >= l.p.stock} aria-label="+"><Plus size={14} /></button>
                  </div></div>
                <div className="mkd__sum"><b>{rupiah(l.qty * l.p.price)}</b><button type="button" className="mkd__rm" onClick={() => removeFromCart(l.productId)} aria-label={t('Remove')}><Trash2 size={15} /></button></div>
              </div>))}
          </div>
          <footer className="mkd__foot">
            <p className="mkd__total"><span>{t('Subtotal')}</span><b>{rupiah(sub)}</b></p>
            <small className="mk__muted">{t('Shipping and tax not included. Creates a prototype order only.')}</small>
            <button type="button" className="mk-btn" disabled={!lines.length} onClick={() => { placeOrder(); onClose(); onOrdered() }}>{t('Place prototype order')}</button>
          </footer>
        </motion.aside>
      </motion.div>)}</AnimatePresence>, document.body)
}
