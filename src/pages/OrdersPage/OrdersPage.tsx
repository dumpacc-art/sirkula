import { useMemo, useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import type { OrderStatus } from '../../types'
import './OrdersPage.css'
const flow: OrderStatus[] = ['pending','confirmed','preparing','dispatched','delivered']
export default function OrdersPage() {
  const { orders, user, setOrderStatus, notify } = useStore(); const { t } = useT(); const [q, setQ] = useState(''), [st, setSt] = useState(''), [id, setId] = useState('')
  const rows = useMemo(() => orders.filter(o => (user?.role !== 'buyer' || o.buyer === user.org) && (!q || (o.id + o.buyer).toLowerCase().includes(q.toLowerCase())) && (!st || o.status === st)), [orders, user, q, st])
  const o = orders.find(x => x.id === id), next = o ? flow[flow.indexOf(o.status) + 1] : undefined
  const move = (s: OrderStatus) => { if (!o || !window.confirm(t('Change {id} to "{s}"? (prototype)', { id:o.id, s:t(s) }))) return; setOrderStatus(o.id, s); notify('{id} is now {s}', { id:o.id, s:t(s) }) }
  return (
    <div className="od">
      <header><h1>{t('Orders')}</h1><p>{t(user?.role === 'buyer' ? 'Your orders' : 'All prototype orders')}. {t('No real payments or shipments.')}</p></header>
      <div className="od__f"><input placeholder={t('Search order or buyer')} value={q} onChange={e => setQ(e.target.value)} /><Select value={st} onChange={setSt} options={[{ value:'', label:t('All statuses') }, ...[...flow, 'cancelled'].map(s => ({ value:s, label:t(s) }))]} /></div>
      <div className="od__cols">
        <div>{rows.length === 0 ? <p className="od__muted">{t('No orders to show.')}</p> : rows.map(r => <button key={r.id} className={`od__row${r.id === id ? ' on' : ''}`} onClick={() => setId(r.id)}><b>{r.id}</b><span>{r.buyer} · {r.date}</span><span>${r.total}</span><StatusBadge status={r.status} /></button>)}</div>
        {o ? <div className="od__d"><h2>{o.id}</h2><p className="od__muted">{t('Buyer')}: {o.buyer} · {o.date}</p>{o.lines.map(l => <p key={l.productId}>{l.qty} × {t(l.name)} @ ${l.price}</p>)}<p><b>{t('Total')} ${o.total}</b> <small className="od__muted">({t('shipping and tax not included')})</small></p>
          <p className="od__muted">{t('Timeline')}: {flow.slice(0, flow.indexOf(o.status) + 1).map(x => t(x)).join(' → ') || t(o.status)}{o.status === 'cancelled' && ` · ${t('cancelled')}`}</p>
          <div className="od__act">{next && <button onClick={() => move(next)}>{t('Mark {s}', { s:t(next) })}</button>}{['pending','confirmed','preparing'].includes(o.status) && <button className="alt" onClick={() => move('cancelled')}>{t('Cancel order')}</button>}</div></div> : <p className="od__muted">{t('Select an order.')}</p>}
      </div>
    </div>
  )
}
