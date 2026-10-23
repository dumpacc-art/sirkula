import { useNavigate } from 'react-router-dom'
import { Crown, X } from 'lucide-react'
import '../pages/Sirkula.css'
export default function PremiumModal({ open, feature, onClose }: { open: boolean; feature: string; onClose: () => void }) {
  const nav = useNavigate()
  if (!open) return null
  return (
    <div className="sk-overlay" onClick={onClose}>
      <div className="sk-dialog" onClick={e => e.stopPropagation()}>
        <button className="sk-x" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        <Crown size={28} className="sk-accent" />
        <h3>{feature} khusus Premium</h3>
        <p>Upgrade untuk membuka fitur ini. Fitur dasar SIRKULA tetap bisa dipakai gratis.</p>
        <div className="sk-row"><button className="sk-btn sk-ghost" onClick={onClose}>Nanti saja</button>
          <button className="sk-btn" onClick={() => { onClose(); nav('/app/premium') }}>Lihat paket Premium</button></div>
      </div>
    </div>
  )
}
