import { useMemo } from 'react'
import { Truck, ArrowRight, Package, Scale, Leaf, ClipboardCheck, Store, CircleAlert, Star, MapPin, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import AdminWhatsApp from '../../components/ui/AdminWhatsApp'
import StatusBadge from '../../components/ui/StatusBadge'
import { flowSeries, partnerStats } from '../../data/demoData'
import { stages } from '../../features/traceability/lifecycle'
import { ORDER_STATES } from '../../features/tracking/orderStateMachine'
import { formatIdr } from '../../features/pricing/collectionPrice'
import './DashboardPage.css'

const PALETTE = ['#0f6b47', '#22c55e', '#c5f26b', '#7fe0b0', '#b4cdbd', '#5b695f', '#f59e0b']
/** Faktor emisi kasar (kg CO2e per kg material) untuk estimasi demo. Bukan angka audit. */
const CO2: Record<string, number> = { Plastic: 1.5, Paper: 0.9, Organic: 0.5, Glass: 0.3, Metal: 4, Textile: 3, Electronics: 2 }
const DONE = ['received', 'processing', 'evidence_submitted', 'verified', 'completed']
const nf = (n: number) => n.toLocaleString('id-ID')

export default function DashboardPage() {
  const { user, batches, activity, pickupOrders, orderHistory, orders, products, notifs } = useStore()
  const { t } = useT(); const nav = useNavigate()

  const m = useMemo(() => {
    const totalKg = batches.reduce((a, b) => a + b.qty, 0)
    const doneBatches = batches.filter(b => DONE.includes(b.status))
    const doneKg = doneBatches.reduce((a, b) => a + b.qty, 0)
    const co2 = doneBatches.reduce((a, b) => a + b.qty * (CO2[b.category] ?? 1), 0)
    const rate = totalKg ? Math.round(doneKg / totalKg * 100) : 0
    const active = batches.filter(b => !['completed', 'rejected'].includes(b.status)).length
    const waiting = batches.filter(b => ['registered', 'validated'].includes(b.status)).length
    const pendingEv = batches.filter(b => b.evidence === 'pending').length
    const exceptions = batches.filter(b => b.status === 'exception')
    const byCat = Object.entries(batches.reduce<Record<string, number>>((a, b) => ({ ...a, [b.category]: (a[b.category] ?? 0) + b.qty }), {})).sort((a, b) => b[1] - a[1])
    const byRegion = Object.entries(batches.reduce<Record<string, number>>((a, b) => ({ ...a, [b.region]: (a[b.region] ?? 0) + b.qty }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const pipeline = stages.map(s => ({ key: s.key, label: s.label, n: batches.filter(b => b.status === s.key).length }))
    const sales = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0)
    const openOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'dispatched'].includes(o.status)).length
    const lowStock = products.filter(p => p.stock <= 5)
    const pickedKg = orderHistory.reduce((a, o) => a + (o.measuredKg ?? o.waste.kg), 0)
    return { totalKg, doneKg, co2, rate, active, waiting, pendingEv, exceptions, byCat, byRegion, pipeline, sales, openOrders, lowStock, pickedKg }
  }, [batches, orders, products, orderHistory])

  const latest = pickupOrders[0]
  const step = latest ? ORDER_STATES.indexOf(latest.status) : 0
  const unread = notifs.filter(n => !n.read).length
  const series = flowSeries.map(f => ({ m: t(f.m), [t('Collected')]: f.collected, [t('Processed')]: f.processed }))
  const catData = m.byCat.map(([name, value]) => ({ name: t(name), value }))
  const regData = m.byRegion.map(([name, value]) => ({ name: t(name), value }))
  const maxPipe = Math.max(1, ...m.pipeline.map(p => p.n))

  const tasks = [
    ...batches.filter(b => ['registered', 'validated'].includes(b.status)).slice(0, 3).map(b => ({ k: `m${b.id}`, text: t('Find a match for {id}', { id: b.id }), to: '/app/pickup', tone: 'info' })),
    ...batches.filter(b => b.evidence === 'pending').map(b => ({ k: `e${b.id}`, text: t('Review evidence for {id}', { id: b.id }), to: '/app/orders', tone: 'warn' })),
    ...m.exceptions.map(b => ({ k: `x${b.id}`, text: t('Check weight discrepancy on {id}', { id: b.id }), to: '/app/orders', tone: 'bad' })),
    ...m.lowStock.map(p => ({ k: `s${p.id}`, text: t('Low stock: {name} ({n} left)', { name: p.name, n: p.stock }), to: '/app/marketplace', tone: 'warn' })),
  ]

  const kpis = [
    { Icon: Package, label: 'Active batches', value: nf(m.active), hint: t('{n} awaiting matching', { n: m.waiting }) },
    { Icon: Scale, label: 'Registered volume', value: `${nf(m.totalKg)} kg`, hint: t('{n} kg already processed', { n: nf(m.doneKg) }) },
    { Icon: Leaf, label: 'Diversion rate', value: `${m.rate}%`, hint: t('Share of volume past collection') },
    { Icon: Leaf, label: 'Est. CO₂e avoided', value: `${nf(Math.round(m.co2 / 1000 * 10) / 10)} t`, hint: t('Estimate, demo factors') },
    { Icon: ClipboardCheck, label: 'Pending evidence', value: nf(m.pendingEv), hint: t('Waiting for review') },
    { Icon: Store, label: 'Marketplace sales', value: formatIdr(m.sales), hint: t('{n} open orders', { n: m.openOrders }) },
  ]

  return (
    <div className="db">
      <header className="db__head">
        <div>
          <p className="db__eyebrow">{user?.org}</p>
          <h1>{t('Welcome back, {name}', { name: user?.name ?? t('guest') })}</h1>
          <p className="db__sub">{t('Your material batches')} · {t('{n} unread notifications', { n: unread })}</p>
        </div>
        <div className="db__acts">
          <button type="button" className="db__btn" onClick={() => nav('/app/materials')}>{t('Register batch')}</button>
          <AdminWhatsApp variant="solid" />
        </div>
      </header>

      {/* Tombol pickup: elemen statis (tanpa animasi masuk) supaya tidak bisa tersangkut transparan. */}
      <section className="db__cta" aria-label={t('Request food waste pickup')}>
        <span className="db__ctaIcon" aria-hidden="true"><Truck size={28} /></span>
        <div className="db__ctaText">
          <h2>{t('Request food waste pickup')}</h2>
          <p>{t('Schedule a collection from your location in under a minute.')}</p>
          <ul className="db__ctaMeta">
            <li><Clock size={14} aria-hidden="true" />{t('{n} active pickups', { n: pickupOrders.length })}</li>
            <li><Scale size={14} aria-hidden="true" />{t('{n} kg collected so far', { n: nf(m.pickedKg) })}</li>
          </ul>
        </div>
        <button type="button" className="db__ctaBtn" onClick={() => nav('/app/pickup?new=1')}>{t('Request now')}<ArrowRight size={18} /></button>
      </section>

      <section className="db__kpis" aria-label={t('Key figures')}>
        {kpis.map(k => (
          <div className="db__kpi" key={k.label}>
            <span className="db__kpiIcon" aria-hidden="true"><k.Icon size={16} /></span>
            <span className="db__kpiLabel">{t(k.label)}</span>
            <strong>{k.value}</strong>
            <small>{k.hint}</small>
          </div>
        ))}
      </section>

      <section className="db__grid db__grid--a">
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Material flow (DEMO DATA, tonnes)')}</h3></div>
          <div className="db__chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="#dde6d9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} /><Tooltip />
                <Area type="monotone" dataKey={t('Collected')} stroke="#0f6b47" strokeWidth={2} fill="#b4cdbd" fillOpacity={.55} />
                <Area type="monotone" dataKey={t('Processed')} stroke="#22c55e" strokeWidth={2} fill="#c5f26b" fillOpacity={.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Registered kg by category')}</h3></div>
          <div className="db__donut">
            <div className="db__donutChart">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={catData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none">{catData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
              <div className="db__donutMid"><strong>{nf(m.totalKg)}</strong><span>kg</span></div>
            </div>
            <ul className="db__legend">
              {catData.map((c, i) => <li key={c.name}><i style={{ background: PALETTE[i % PALETTE.length] }} /><span>{c.name}</span><b>{m.totalKg ? Math.round(c.value / m.totalKg * 100) : 0}%</b></li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="db__grid db__grid--b">
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Batch pipeline')}</h3><Link to="/app/materials">{t('View all')}</Link></div>
          <ul className="db__pipe">
            {m.pipeline.map(p => (
              <li key={p.key}><span>{t(p.label)}</span><div className="db__bar"><i style={{ width: `${p.n ? Math.max(8, p.n / maxPipe * 100) : 0}%` }} /></div><b>{p.n}</b></li>
            ))}
          </ul>
        </div>
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Volume by province (kg)')}</h3></div>
          <div className="db__chart db__chart--sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} fontSize={12} /><Tooltip cursor={{ fill: 'rgba(15,107,71,.06)' }} />
                <Bar dataKey="value" fill="#0f6b47" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="db__card db__live">
          <div className="db__cardHead"><h3>{t('Pickup in progress')}</h3><Link to="/app/orders">{t('Open active orders')}</Link></div>
          {latest ? (
            <>
              <p className="db__liveId"><b>{latest.id}</b> <StatusBadge status={latest.status} /></p>
              <p className="db__liveMeta"><MapPin size={14} aria-hidden="true" />{latest.address}</p>
              <div className="db__steps" aria-hidden="true">{ORDER_STATES.map((s, i) => <i key={s} className={i <= step ? 'on' : ''} />)}</div>
              <p className="db__liveMeta">{t('{a} kg · {b}', { a: latest.waste.kg, b: latest.partner.name })}</p>
            </>
          ) : (
            <div className="db__none"><p>{t('No pickup is running right now.')}</p><button type="button" className="db__btn db__btn--sm" onClick={() => nav('/app/pickup?new=1')}>{t('Request now')}</button></div>
          )}
        </div>
      </section>

      <section className="db__grid db__grid--c">
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Pending actions')}</h3><span className="db__count">{tasks.length}</span></div>
          {tasks.length ? <ul className="db__list">{tasks.map(x => <li key={x.k}><Link to={x.to}><CircleAlert size={15} className={`db__tone db__tone--${x.tone}`} aria-hidden="true" /><span>{x.text}</span><ArrowRight size={14} aria-hidden="true" /></Link></li>)}</ul> : <p className="db__empty">{t('Nothing needs attention.')}</p>}
        </div>
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Recent activity')}</h3></div>
          <ul className="db__list db__list--time">{activity.slice(0, 6).map(a => <li key={a.id}><Link to={a.link}><span>{t(a.text)}</span><small>{t(a.time)}</small></Link></li>)}</ul>
        </div>
        <div className="db__card">
          <div className="db__cardHead"><h3>{t('Top pickup partners')}</h3><Link to="/app/partners">{t('Find Partners')}</Link></div>
          <ol className="db__rank">
            {partnerStats.map((p, i) => (
              <li key={p.name}><span className="db__pos">{i + 1}</span><div><b>{p.name}</b><small>{t(p.region)} · {t('{n} pickups', { n: p.pickups })} · {t('{n}% on time', { n: p.onTime })}</small></div><span className="db__stars"><Star size={13} aria-hidden="true" />{p.rating}</span></li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
