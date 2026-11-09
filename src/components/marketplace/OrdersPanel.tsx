import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { rupiah } from '../../lib/pricing'
import Select from '../ui/Select'
import Modal from '../ui/Modal'
import StatusBadge from '../ui/StatusBadge'
import type { OrderStatus } from '../../types'
const flow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'dispatched', 'delivered']

/** Pesanan marketplace. Bagian dari halaman Marketplace (bukan tab terpisah). */
export default function OrdersPanel() {
  const { orders, setOrderStatus, notify } = useStore(); const { t } = useT()
  const [q, setQ] = useState(''), [st, setSt] = useState(''), [id, setId] = useState('')
  const rows = useMemo(() => orders.filter(o => (!q || (o.id + o.buyer).toLowerCase().includes(q.toLowerCase())) && (!st || o.status === st)), [orders, q, st])
  const o = orders.find(x => x.id === id), next = o ? flow[flow.indexOf(o.status) + 1] : undefined
  const move = (s: OrderStatus) => { if (!o || !window.confirm(t('Change {id} to "{s}"? (prototype)', { id: o.id, s: t(s) }))) return; setOrderStatus(o.id, s); notify('{id} is now {s}', { id: o.id, s: t(s) }) }
  return (
    <div className="mko">
      <div className="mko__f">
        <input placeholder={t('Search order or buyer')} value={q} onChange={e => setQ(e.target.value)} aria-label={t('Search order or buyer')} />
        <Select value={st} onChange={setSt} options={[{ value: '', label: t('All statuses') }, ...[...flow, 'cancelled'].map(s => ({ value: s, label: t(s) }))]} />
      </div>
      {rows.length === 0 ? <p className="mk__muted">{t('No orders to show.')}</p> : (
        <div className="mko__grid">{rows.map(r => {
          const at = flow.indexOf(r.status)
          return (
            <button key={r.id} type="button" className="mko__card" onClick={() => setId(r.id)}>
              <div className="mko__top"><b>{r.id}</b><StatusBadge status={r.status} /></div>
              <p className="mko__who">{r.buyer} · {r.date}</p>
              <p className="mko__items">{r.lines.map(l => `${l.qty}× ${t(l.name)}`).join(', ')}</p>
              <div className="mko__bar" aria-hidden="true">{flow.map((s, i) => <i key={s} className={r.status !== 'cancelled' && i <= at ? 'on' : ''} />)}</div>
              <b className="mko__tot">{rupiah(r.total)}</b>
            </button>)
        })}</div>)}
      <Modal open={!!o} title={o?.id ?? ''} onClose={() => setId('')}>
        {o && <div className="mko__d">
          <p className="mk__muted">{t('Buyer')}: {o.buyer} · {o.date}</p>
          <ul className="mko__lines">{o.lines.map(l => <li key={l.productId}><span>{l.qty} × {t(l.name)}</span><b>{rupiah(l.qty * l.price)}</b></li>)}</ul>
          <p className="mko__sum"><span>{t('Total')}</span><b>{rupiah(o.total)}</b></p>
          <small className="mk__muted">{t('shipping and tax not included')}</small>
          <ol className="mko__steps">{flow.map((s, i) => <li key={s} className={o.status !== 'cancelled' && i <= flow.indexOf(o.status) ? 'on' : ''}><span>{o.status !== 'cancelled' && i <= flow.indexOf(o.status) ? <Check size={12} /> : i + 1}</span>{t(s)}</li>)}</ol>
          {o.status === 'cancelled' && <p className="mko__cancel">{t('cancelled')}</p>}
          <div className="mko__act">
            {next && <button type="button" className="mk-btn" onClick={() => move(next)}>{t('Mark {s}', { s: t(next) })}</button>}
            {['pending', 'confirmed', 'preparing'].includes(o.status) && <button type="button" className="mk-btn mk-btn--ghost" onClick={() => move('cancelled')}>{t('Cancel order')}</button>}
          </div>
        </div>}
      </Modal>
    </div>
  )
}
