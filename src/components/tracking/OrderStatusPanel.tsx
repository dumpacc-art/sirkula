import { useState } from 'react'
import CourierScene from './CourierScene'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import { ORDER_STATES, PHASE, nextState, stateIndex } from '../../features/tracking/orderStateMachine'
import type { OrderState, PickupOrder } from '../../types'
import { formatIdr } from '../../features/pricing/collectionPrice'
import './OrderStatusPanel.css'

const LABEL: Record<OrderState, string> = {
  pending_match: 'Pending match', matched: 'Matched', scheduled: 'Scheduled', collector_assigned: 'Collector assigned',
  on_the_way_to_pickup: 'On the way to pickup', arrived_at_pickup: 'Arrived at pickup', waste_collected: 'Waste collected',
  in_transit_to_processor: 'In transit to processor', arrived_at_processor: 'Arrived at processor', completed: 'Completed',
}
const PHASE_LABEL = { planning: 'Planning', pickup: 'Pickup', transit: 'Transit', done: 'Done' } as const

/** Order status with the full state sequence. The demo button advances one step; statuses are never skipped.
 *  Completing the order asks for the weight measured at the processor. */
export default function OrderStatusPanel({ order, facilityMissing, onAdvance }: { order: PickupOrder; facilityMissing: boolean; onAdvance: (measuredKg?: number) => void }) {
  const { t } = useT()
  const cur = stateIndex(order.status), next = nextState(order.status)
  const [weigh, setWeigh] = useState(String(order.waste.kg))
  const weighKg = Number(weigh)
  const weighValid = Number.isFinite(weighKg) && weighKg > 0 && weighKg <= 100000
  const completing = next === 'completed'
  const submit = () => { if (completing) { if (weighValid) onAdvance(weighKg) } else onAdvance() }
  const at = (s: OrderState) => [...order.statusHistory].reverse().find(h => h.status === s)?.at
  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
  return (
    <aside className="osp" aria-label={t('Order status')}>
      <header className="osp__head">
        <span className="osp__id">{order.id}</span>
        <span className={`osp__phase osp__phase--${PHASE[order.status]}`}>{t(PHASE_LABEL[PHASE[order.status]])}</span>
      </header>
      <CourierScene status={order.status} />
      <h2 className="osp__now">{t(LABEL[order.status])}</h2>

      <ol className="osp__tl">
        {ORDER_STATES.map((s, i) => {
          const state = i < cur ? 'done' : i === cur ? 'current' : 'pending'
          return (
            <li key={s} className={`osp__step osp__step--${state}`}>
              <i aria-hidden="true">{state === 'done' ? '✓' : i + 1}</i>
              <div><b>{t(LABEL[s])}</b>{at(s) && <small>{fmt(at(s))}</small>}</div>
            </li>
          )
        })}
      </ol>

      {completing && (
        <label className="osp__weigh">
          <span>{t('Measured weight at processor (kg)')}</span>
          <input type="number" min="0" step="0.1" inputMode="decimal" value={weigh} onChange={e => setWeigh(e.target.value)} aria-invalid={!weighValid || undefined} />
          {!weighValid && <small role="alert">{t('Enter a weight greater than 0')}</small>}
        </label>
      )}
      <Button size="lg" onClick={submit} disabled={!next || (completing && !weighValid)} className="osp__demo">
        {next ? (completing ? t('Complete order and record weight') : `${t('Simulate next status')}: ${t(LABEL[next])}`) : t('Order completed')}
      </Button>
      <p className="osp__note">{t('Demo mode: statuses advance manually for presentation. Not connected to real collectors.')}</p>

      <dl className="osp__facts">
        <dt>{t('Partner')}</dt><dd>{order.partner.name}</dd>
        <dt>{t('Quantity')}</dt><dd>{order.waste.kg} kg</dd>
        {order.collector && <><dt>{t('Collector (demo)')}</dt><dd>{t(order.collector.name)} · {t(order.collector.vehicle)}</dd></>}
        <dt>{t('Pickup point')}</dt><dd>{order.address}</dd>
        {order.price && <><dt>{t('Total')}</dt><dd>{formatIdr(order.price.total)}</dd></>}
      </dl>
      {facilityMissing && <p className="osp__warn" role="note">{t('Processing facility not found for this order.')}</p>}
    </aside>
  )
}
