import Logo from '../brand/Logo'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import { formatIdr } from '../../features/pricing/collectionPrice'
import type { PickupOrder } from '../../types'
import './PickupReceipt.css'

/** Official pickup summary for a completed order. The price is the quote confirmed at booking; measured weight is recorded alongside it. */
export default function PickupReceipt({ order }: { order: PickupOrder }) {
  const { t, lang } = useT()
  const locale = lang === 'Bahasa Indonesia' ? 'id-ID' : 'en-US'
  const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
  const p = order.price
  const paid = order.paymentStatus === 'paid'
  const measured = order.measuredKg
  return (
    <article className="rcp" aria-label={t('Pickup receipt')}>
      <header className="rcp__head">
        <span className="rcp__brand"><Logo variant="lockup" height={34} /></span>
        <h3>{t('Pickup receipt')}</h3>
        <p>{t('Official pickup summary')}</p>
      </header>

      <dl className="rcp__meta">
        <dt>{t('Order ID')}</dt><dd className="rcp__mono">{order.id}</dd>
        <dt>{t('Order date')}</dt><dd>{fmt(order.createdAt)}</dd>
        <dt>{t('Completed')}</dt><dd>{fmt(order.completedAt)}</dd>
        <dt>{t('Partner')}</dt><dd>{order.partner.name}{order.partner.team ? ` (${t('SIRKULA team')})` : ''}</dd>
        <dt>{t('Pickup point')}</dt><dd>{order.address}</dd>
        <dt>{t('Waste categories')}</dt><dd>{order.waste.categories.join(', ') || '—'}</dd>
      </dl>

      <div className="rcp__sep" />
      <dl className="rcp__rows">
        <dt>{t('Requested weight')}</dt><dd>{order.waste.kg} kg</dd>
        <dt>{t('Measured weight')}</dt><dd>{measured != null ? `${measured} kg` : '—'}</dd>
        {order.waste.bags != null && <><dt>{t('Bags')}</dt><dd>{order.waste.bags}</dd></>}
      </dl>

      <div className="rcp__sep" />
      <h4>{t('Cost breakdown')}</h4>
      {p ? (
        <dl className="rcp__rows">
          <dt>{t('Fixed fee')}</dt><dd>{formatIdr(p.fixed)}</dd>
          <dt>{t('Transport')}<small>{p.distanceKm.toFixed(1)} km × {formatIdr(p.transportRate)}/km</small></dt><dd>{formatIdr(p.transport)}</dd>
          <dt>{t('Handling')}<small>{p.weightKg} kg × {formatIdr(p.handlingRate)}/kg</small></dt><dd>{formatIdr(p.handling)}</dd>
          {p.rounding !== 0 && <><dt>{t('Rounding')}</dt><dd>{formatIdr(p.rounding)}</dd></>}
          <dt className="rcp__total">{t('Total')}</dt><dd className="rcp__total">{formatIdr(p.total)}</dd>
        </dl>
      ) : (
        <p className="rcp__muted">{t('Price not calculated for this order.')}</p>
      )}

      <div className="rcp__sep" />
      <dl className="rcp__rows">
        <dt>{t('Payment status')}</dt>
        <dd><span className={`rcp__pay rcp__pay--${paid ? 'paid' : 'unpaid'}`}>{t(paid ? 'Paid' : 'Unpaid')}</span></dd>
      </dl>

      <p className="rcp__foot">{t('Handling fee is based on the requested weight at booking. The measured weight is recorded for reconciliation.')}</p>
      <p className="rcp__foot">{t('Demo document. No real payment was processed.')}</p>

      <div className="rcp__actions">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>{t('Print receipt')}</Button>
      </div>
    </article>
  )
}
