import { Scale, Layers, MapPin, CircleDot } from 'lucide-react'
import { useT } from '../../i18n'
import type { Submission } from '../../types'

/** Four-tile overview of the order being processed (weight, categories, pickup point, status). */
export default function OrderTiles({ sub }: { sub: Submission }) {
  const { t } = useT()
  const status = sub.orderId ? 'Confirmed' : sub.partner ? 'Partner selected' : 'Waiting for partner'
  return (
    <div className="pw__tiles">
      <div><Scale size={16} /><small>{t('Estimated total weight (kg)')}</small><b>{sub.quantity.kg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg</b></div>
      <div><Layers size={16} /><small>{t('Waste categories')}</small><b>{sub.wasteTypes.length}</b></div>
      <div className="pw__tile--wide"><MapPin size={16} /><small>{t('Pickup point')}</small><b title={sub.pickup.addressText}>{sub.pickup.addressText || '—'}</b></div>
      <div><CircleDot size={16} /><small>{t('Status')}</small><b>{t(status)}</b></div>
    </div>
  )
}
