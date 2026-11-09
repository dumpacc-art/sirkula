import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import Modal from '../ui/Modal'
import './PremiumModal.css'
export default function PremiumModal({ open, feature, onClose }: { open: boolean; feature: string; onClose: () => void }) {
  const nav = useNavigate()
  return (
    <Modal open={open} title={`${feature} khusus Premium`} onClose={onClose}>
      <div className="pm">
        <Crown size={28} className="pm__accent" />
        <p>Upgrade untuk membuka fitur ini. Fitur dasar SIRKULA tetap bisa dipakai gratis.</p>
        <div className="pm__row">
          <button className="pm__btn pm__btn--ghost" onClick={onClose}>Nanti saja</button>
          <button className="pm__btn" onClick={() => { onClose(); nav('/app/premium') }}>Lihat paket Premium</button>
        </div>
      </div>
    </Modal>
  )
}
