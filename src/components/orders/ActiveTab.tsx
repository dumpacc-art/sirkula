import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../ui/Select'
import StatusBadge from '../ui/StatusBadge'
import OrderMap from '../tracking/OrderMap'
import OrderStatusPanel from '../tracking/OrderStatusPanel'
import CompletionAnimation from '../tracking/CompletionAnimation'
import type { PickupOrder } from '../../types'
import { stages, stageState, weights } from '../../features/traceability/lifecycle'
import { buildRoute, vehiclePosition } from '../../features/tracking/routeDemo'
import { EWASTE_TEAM } from '../../config/ewasteTeam'
import './ActiveTab.css'

/** Orders › Active. The map is the main view; the order state machine drives the status panel. Batch details and evidence stay below. */
export default function ActiveTab({ onViewReceipt }: { onViewReceipt: (orderId: string) => void }) {
  const { batches, evidence, addEvidence, reviewEvidence, notify, pickupOrders, orderHistory, advancePickupOrder, partners } = useStore(); const { t } = useT()
  const [params, setParams] = useSearchParams()
  const [orderId, setOrderId] = useState<string>(params.get('order') ?? pickupOrders[0]?.id ?? '')
  useEffect(() => { const p = params.get('order'); if (p) setOrderId(p) }, [params])
  const order = pickupOrders.find(o => o.id === orderId) ?? pickupOrders[0]

  // Completion: the order leaves the active session (moves to History). The animation shows once for it.
  const [celebrating, setCelebrating] = useState<PickupOrder | null>(null)
  const handleAdvance = (measuredKg?: number) => {
    if (!order) return
    const done = advancePickupOrder(order.id, measuredKg)
    if (done) { setParams({}, { replace: true }); setCelebrating(done) }
  }

  // Batch section (legacy traceability view)
  const [bid, setBid] = useState(order?.batchId ?? batches[0]?.id ?? '')
  useEffect(() => { if (order?.batchId) setBid(order.batchId) }, [order?.batchId])
  const [sel, setSel] = useState(0), [note, setNote] = useState('')
  const b = batches.find(x => x.id === bid); const w = weights[bid]; const ev = evidence.filter(e => e.batchId === bid)
  const st = stages[sel], state = b ? stageState(b.status, sel) : 'pending'

  // Map geometry for the selected order
  const facility = order ? (order.partner.team ? EWASTE_TEAM.hub : partners.find(p => p.id === order.partner.id)?.base ?? null) : null
  const route = order && facility ? buildRoute(order.coords, facility) : null
  const vehicle = route && order ? vehiclePosition(route, order.status) : null

  return (
    <div className="bt">
      {!order ? (
        <div className="bt__empty">
          <span className="bt__emptyIcon"><Truck size={22} aria-hidden="true" /></span>
          <h3>{t('No active pickups')}</h3><p>{t('Start one from Pickup. It appears here once you confirm it.')}</p>
          <Link className="bt__cta" to="/app/pickup?new=1">{t('Create pickup')}</Link>
          {orderHistory.length > 0 && <Link className="bt__histLink" to="/app/orders?tab=history">{t('View completed pickups in History')}</Link>}
        </div>
      ) : (
        <>
          {pickupOrders.length > 1 && (
            <div className="bt__sel"><Select value={order.id} onChange={v => setOrderId(v)}
              options={pickupOrders.map(o => ({ value: o.id, label: `${o.id} · ${o.partner.name}` }))} /></div>
          )}
          <div className="bt__main">
            <section className="bt__mapWrap" aria-label={t('Pickup map')}>
              <OrderMap pickup={order.coords} facility={facility} route={route} vehicle={vehicle} />
              <div className="bt__legend" aria-label={t('Map legend')}>
                <span><i className="lg lg--pickup" />{t('Pickup point')}</span>
                <span><i className="lg lg--fac" />{t('Processing facility')}</span>
                <span><i className="lg lg--veh" />{t('Collector vehicle (demo)')}</span>
                <span><i className="lg lg--dash" />{t('Collector route (demo)')}</span>
                <span><i className="lg lg--solid" />{t('Transport route (demo)')}</span>
              </div>
              <small className="bt__muted">{t('Route and vehicle positions are demo coordinates; the vehicle is stationary.')}</small>
            </section>
            <OrderStatusPanel key={order.id} order={order} facilityMissing={!facility} onAdvance={handleAdvance} />
          </div>
        </>
      )}

      {celebrating && (
        <CompletionAnimation orderId={celebrating.id} partnerName={celebrating.partner.name}
          onView={() => { const id = celebrating.id; setCelebrating(null); onViewReceipt(id) }}
          onClose={() => setCelebrating(null)} />
      )}

      {b && (
        <section className="bt__detail">
          <h2>{t('Batch details and evidence')}</h2>
          <div className="bt__sel"><Select value={bid} onChange={v => { setBid(v); setSel(0) }} options={batches.map(x => ({ value: x.id, label: `${x.id} · ${t(x.name)}` }))} />
            <span>{b.qty.toLocaleString()} {b.unit} · {b.source} · {t(b.region)}</span><StatusBadge status={b.status} /></div>
          <ol className="bt__tl">{stages.map((s, i) => { const ts = stageState(b.status, i); return (
            <motion.li key={`${bid}-${s.key}`} className={`${ts}${i === sel ? ' sel' : ''}`} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i * .06 }}>
              <button onClick={() => setSel(i)}><i>{ts === 'done' ? '✓' : ts === 'exception' ? '!' : i + 1}</i><span>{t(s.label)}</span></button></motion.li>) })}</ol>
          <section className="bt__grid">
            <div className="bt__card"><h3>{t(st.label)}</h3><dl><dt>{t('Event')}</dt><dd>{t(st.event)}</dd><dt>{t('State')}</dt><dd>{t(state)}</dd><dt>{t('Responsible')}</dt><dd>{sel < 3 ? b.source : t(sel < 5 ? 'Transport provider (demo)' : 'Processor (demo)')}</dd>
              <dt>{t('Recorded')}</dt><dd>{state === 'pending' ? t('Not yet recorded') : `${b.date} (+${sel} ${t('d')}, demo)`}</dd><dt>{t('Quantity')}</dt><dd>{b.qty} {b.unit}</dd></dl></div>
            <div className="bt__card"><h3>{t('Weight reconciliation')}</h3>{w ? (<><table><tbody>{(['pickup','received','input','output'] as const).map(k => <tr key={k}><td>{t(k)}</td><td>{w[k].toLocaleString()} kg</td></tr>)}</tbody></table>
              {w.pickup !== w.received && <p className="bt__warn">{t('Discrepancy')}: {w.pickup - w.received} kg. {t(w.note ?? 'Difference between pickup and receiving weight.')}</p>}</>) : <p className="bt__muted">{t('No weights recorded yet.')}</p>}
              <small className="bt__muted">{t('Historical weights are never overwritten.')}</small></div>
          </section>
          <section className="bt__card"><h3>{t('Evidence')}</h3>
            {ev.length === 0 ? <p className="bt__muted">{t('No evidence submitted.')}</p> : ev.map(e => <div key={e.id} className="bt__ev"><span>{t(e.note)} · {e.by} · {e.date}</span><StatusBadge status={e.status.replace(' ', '_')} />
              {e.status === 'awaiting review' && <span><button onClick={() => { reviewEvidence(e.id, true); notify('Evidence accepted') }}>{t('Approve')}</button> <button className="alt" onClick={() => { reviewEvidence(e.id, false); notify('Evidence rejected') }}>{t('Reject')}</button></span>}</div>)}
            <div className="bt__add"><input placeholder={t('Evidence note or document reference')} value={note} onChange={e => setNote(e.target.value)} />
              <button onClick={() => { if (!note.trim()) { notify('Enter a note first'); return } addEvidence(bid, note.trim()); setNote(''); notify('Evidence submitted for review') }}>{t('Submit evidence')}</button></div>
          </section>
        </section>
      )}
    </div>
  )
}
