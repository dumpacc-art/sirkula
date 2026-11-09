import { CheckCircle2, MapPin, Route, ArrowRight, Undo2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import OrderTiles from './OrderTiles'
import { quoteForChosen } from './quote'
import { EWASTE_TEAM } from '../../config/ewasteTeam'
import { formatIdr } from '../../features/pricing/collectionPrice'
import type { Submission } from '../../types'

/** Pickup › step 3 (Confirm). Shows the chosen partner and the price breakdown. Confirming creates the order and opens it in Orders. */
export default function ConfirmStep({ sub, onConfirm, onOpenOrders }: { sub: Submission; onConfirm: (s: Submission) => void; onOpenOrders: () => void }) {
  const { cancelPartner, partners } = useStore(); const { t } = useT()
  const partner = sub.partner!
  const name = partner.team ? t(EWASTE_TEAM.name) : partner.name
  const quote = quoteForChosen(sub, partners)
  const b = quote?.status === 'ok' ? quote.breakdown : null
  const confirmed = !!sub.orderId
  return (
    <div className="pw__stack">
      <section className="pw__card pw__confirm">
        <header className="pw__confirmHead">
          <span className="pw__badge"><CheckCircle2 size={18} aria-hidden="true" /></span>
          <div>
            <small>{confirmed ? t('Order confirmed') : t('Selected partner')}</small>
            <h2>{name}</h2>
            <p>{partner.team ? t('SIRKULA team') : <><Route size={13} aria-hidden="true" /> {partner.distanceKm.toFixed(1)} km</>}{confirmed && <> · {t('Order ID')} <b>{sub.orderId}</b></>}</p>
          </div>
        </header>

        <OrderTiles sub={sub} />

        <div className="pw__price">
          <h3>{t('Price breakdown')}</h3>
          {b ? (
            <dl>
              <dt>{t('Fixed fee')}</dt><dd>{formatIdr(b.fixed)}</dd>
              <dt>{t('Transport')} <em>{b.distanceKm.toFixed(1)} km × {formatIdr(b.transportRate)}</em></dt><dd>{formatIdr(b.transport)}</dd>
              <dt>{t('Handling')} <em>{b.weightKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg × {formatIdr(b.handlingRate)}</em></dt><dd>{formatIdr(b.handling)}</dd>
              {b.rounding !== 0 && <><dt>{t('Rounding')}</dt><dd>{formatIdr(b.rounding)}</dd></>}
              <dt className="pw__total">{t('Total')}</dt><dd className="pw__total">{formatIdr(b.total)}</dd>
            </dl>
          ) : (
            <p className="pw__muted"><MapPin size={14} aria-hidden="true" /> {partner.team ? t('The SIRKULA team confirms the price for e-waste after collection.') : t('No price could be calculated for this partner.')}</p>
          )}
        </div>

        {confirmed ? (
          <div className="pw__actions"><Button size="lg" icon={<ArrowRight size={16} />} onClick={onOpenOrders}>{t('Track in Orders')}</Button></div>
        ) : (
          <div className="pw__actions">
            <Button variant="ghost" icon={<Undo2 size={15} />} onClick={() => cancelPartner(sub.id)}>{t('Change partner')}</Button>
            <Button size="lg" onClick={() => onConfirm(sub)}>{t('Confirm pickup')}</Button>
          </div>
        )}
      </section>
    </div>
  )
}
