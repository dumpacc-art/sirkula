import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Receipt, RotateCcw, Trash2, Truck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import OrderPhoto from '../tracking/OrderPhoto'
import PickupReceipt from '../tracking/PickupReceipt'
import { formatIdr } from '../../features/pricing/collectionPrice'
import { ORDER_STATES, DEMO_COLLECTOR } from '../../features/tracking/orderStateMachine'
import { RETENTION_DAYS, daysLeft, expiresAtMs } from '../../features/history/retention'
import { repeatDraftFromOrder } from '../../features/history/repeatOrder'
import type { PickupOrder } from '../../types'
import './HistoryTab.css'

/** Orders › History. Completed pickups stay here after the active tracking session ends. */
export default function HistoryTab() {
  const { orderHistory, pickupOrders, addSubmission, deleteHistoryOrder, notify } = useStore(); const { t, lang } = useT()
  const [params, setParams] = useSearchParams(); const navigate = useNavigate()
  const focusId = params.get('order')
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const receiptOrder = orderHistory.find(o => o.id === receiptId) ?? null
  const deleteTarget = orderHistory.find(o => o.id === deleteId) ?? null
  // Refreshes the "days left" labels while the page is open.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const tm = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(tm) }, [])

  // Repeat order: creates an unconfirmed draft from this record and opens it in SmartMatch for review.
  // Partner availability, distance and price are calculated there from current data.
  const repeatOrder = (o: PickupOrder) => {
    const id = addSubmission(repeatDraftFromOrder(o, new Date().toISOString()))
    notify('Draft order created. Review it before confirming.')
    navigate(`/app/pickup?sub=${id}`)
  }

  // Opened from the completion animation: show that order's receipt once.
  const autoOpened = useRef(false)
  useEffect(() => {
    if (autoOpened.current || !focusId || params.get('receipt') !== '1') return
    if (orderHistory.some(o => o.id === focusId)) { autoOpened.current = true; setReceiptId(focusId) }
  }, [focusId, params, orderHistory])

  // Scroll the focused card into view.
  useEffect(() => { if (focusId) document.getElementById(`hist-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [focusId])

  const closeReceipt = () => { setReceiptId(null); if (params.has('receipt')) { const next = new URLSearchParams(params); next.delete('receipt'); setParams(next, { replace: true }) } }
  const totalKg = orderHistory.reduce((a, o) => a + (o.measuredKg ?? o.waste.kg), 0)
  const locale = lang === 'Bahasa Indonesia' ? 'id-ID' : 'en-US'
  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  return (
    <div className="hst">
      {pickupOrders.length > 0 && (
        <Link to="/app/orders" className="hst__active">
          <Truck size={18} aria-hidden="true" />
          <span>{t('{count} pickup still in progress', { count: pickupOrders.length })}</span>
          <span className="hst__go">{t('Open active orders')}</span>
        </Link>
      )}

      {orderHistory.length > 0 && (
        <p className="hst__sum">{t('{count} completed · {kg} kg collected', { count: orderHistory.length, kg: totalKg.toLocaleString(locale) })}</p>
      )}
      <p className="hst__policy">{t('Completed pickups are kept for {days} days, then removed automatically.', { days: RETENTION_DAYS })}</p>

      {orderHistory.length === 0 ? (
        <div className="hst__empty">
          <h3>{t('No completed pickups yet')}</h3>
          <p>{t('When a pickup reaches the processing facility, it moves here with its receipt.')}</p>
          <Link to="/app/orders" className="hst__link">{t('Go to active orders')}</Link>
        </div>
      ) : (
        <ol className="hst__list">
          {orderHistory.map(o => (
            <li key={o.id}>
              <HistoryCard order={o} focused={o.id === focusId} fmt={fmt} now={now}
                onReceipt={() => setReceiptId(o.id)} onRepeat={() => repeatOrder(o)} onDelete={() => setDeleteId(o.id)} />
            </li>
          ))}
        </ol>
      )}

      <Modal open={!!receiptOrder} title={t('Pickup receipt')} onClose={closeReceipt}>
        {receiptOrder && <PickupReceipt order={receiptOrder} />}
      </Modal>

      <Modal open={!!deleteTarget} title={t('Delete history record?')} onClose={() => setDeleteId(null)}>
        {deleteTarget && (
          <div className="hst__confirm">
            <p>{t('{id} will be removed from History, along with its receipt and photo on this device. This cannot be undone.', { id: deleteTarget.id })}</p>
            <div className="hst__confirmActions">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>{t('Cancel')}</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => { deleteHistoryOrder(deleteTarget.id); setDeleteId(null) }}>{t('Delete history')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function HistoryCard({ order: o, focused, fmt, now, onReceipt, onRepeat, onDelete }: {
  order: PickupOrder; focused: boolean; fmt: (iso?: string) => string; now: number
  onReceipt: () => void; onRepeat: () => void; onDelete: () => void
}) {
  const { t } = useT()
  const p = o.price
  const paid = o.paymentStatus === 'paid'
  const expiry = expiresAtMs(o), left = daysLeft(o, now)
  // Timeline: each reached state with its time. Ends with completion.
  const reached = new Map<string, string>()
  for (const h of o.statusHistory) if (!reached.has(h.status)) reached.set(h.status, h.at)
  return (
    <article id={`hist-${o.id}`} className={`hcard${focused ? ' hcard--focus' : ''}`} aria-labelledby={`hist-t-${o.id}`}>
      <header className="hcard__head">
        <div>
          <h2 id={`hist-t-${o.id}`} className="hcard__id">{o.id}</h2>
          <p className="hcard__when">{t('Completed')} · {fmt(o.completedAt ?? o.statusHistory[o.statusHistory.length - 1]?.at)}</p>
        </div>
        <span className="hcard__badge">{t('Completed')}</span>
      </header>

      <div className="hcard__body">
        <OrderPhoto photoId={o.waste.photoId} alt={`${t('Waste photo')} ${o.id}`} />
        <dl className="hcard__facts">
          <dt>{t('Partner')}</dt><dd>{o.partner.name}{o.partner.team ? ` (${t('SIRKULA team')})` : ''}</dd>
          <dt>{t('Waste categories')}</dt><dd>{o.waste.categories.join(', ') || '—'}</dd>
          <dt>{t('Requested weight')}</dt><dd>{o.waste.kg} kg</dd>
          <dt>{t('Measured weight')}</dt><dd>{o.measuredKg != null ? `${o.measuredKg} kg` : '—'}</dd>
          {o.waste.bags != null && <><dt>{t('Bags')}</dt><dd>{o.waste.bags}</dd></>}
          <dt>{t('Pickup point')}</dt><dd>{o.address}</dd>
          <dt>{t('Distance')}</dt><dd>{o.partner.distanceKm.toFixed(1)} km</dd>
          <dt>{t('Collector (demo)')}</dt><dd>{t(DEMO_COLLECTOR.name)} · {t(DEMO_COLLECTOR.vehicle)}</dd>
          <dt>{t('Total')}</dt><dd>{p ? formatIdr(p.total) : t('Not calculated')}</dd>
          <dt>{t('Payment status')}</dt><dd><span className={`hcard__pay hcard__pay--${paid ? 'paid' : 'unpaid'}`}>{t(paid ? 'Paid' : 'Unpaid')}</span></dd>
        </dl>
      </div>

      <details className="hcard__tl">
        <summary>{t('Status timeline')}</summary>
        <ol>
          {ORDER_STATES.filter(s => reached.has(s)).map(s => (
            <li key={s}><span>{t(STATE_LABEL[s])}</span><time>{fmt(reached.get(s))}</time></li>
          ))}
        </ol>
      </details>

      <footer className="hcard__foot">
        {expiry !== null && left !== null && (
          <p className="hcard__expiry" data-urgent={left <= 3 || undefined}>
            {t('Expires {date} · {days} days left', { date: fmt(new Date(expiry).toISOString()), days: left })}
          </p>
        )}
        <div className="hcard__actions">
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={onDelete}>{t('Delete history')}</Button>
          <Button variant="secondary" size="sm" icon={<Receipt size={14} />} onClick={onReceipt}>{t('View receipt')}</Button>
          <Button size="sm" icon={<RotateCcw size={14} />} onClick={onRepeat}>{t('Repeat order')}</Button>
        </div>
      </footer>
    </article>
  )
}

const STATE_LABEL: Record<string, string> = {
  pending_match: 'Pending match', matched: 'Matched', scheduled: 'Scheduled', collector_assigned: 'Collector assigned',
  on_the_way_to_pickup: 'On the way to pickup', arrived_at_pickup: 'Arrived at pickup', waste_collected: 'Waste collected',
  in_transit_to_processor: 'In transit to processor', arrived_at_processor: 'Arrived at processor', completed: 'Completed',
}
