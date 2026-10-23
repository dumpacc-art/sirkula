import { useMemo, useState } from 'react'
import { Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import KpiCard from '../../components/ui/KpiCard'
import PickupModal from '../../components/PickupModal/PickupModal'
import Select from '../../components/ui/Select'
import { flowSeries } from '../../data/demoData'
import type { Role } from '../../types'
import './DashboardPage.css'
const colors = ['#123b2a','#1b5239','#7fe0b0','#c5f26b','#b9c9b4','#7a807b']
const focus: Record<string,string> = { processor:'Incoming material and capacity', seller:'Listings and orders', buyer:'Orders and sourcing', admin:'Platform oversight', community:'Shared initiatives', transport:'Collections', generator:'Your material batches' }
export default function DashboardPage() {
  const { user, batches, activity, setRole } = useStore(); const [pickupOpen, setPickupOpen] = useState(false); const { t } = useT(); const nav = useNavigate()
  const role = (user?.role ?? 'generator') as Role
  const k = useMemo(() => {
    const c = (...s: string[]) => batches.filter(b => s.includes(b.status)).length
    const q = (...s: string[]) => batches.filter(b => s.includes(b.status)).reduce((a, b) => a + b.qty, 0)
    const base = [['Active batches', batches.filter(b => !['completed','rejected'].includes(b.status)).length],
      ['Awaiting matching', c('registered','validated')], ['Scheduled collections', c('collection_scheduled')],
      ['Pending evidence', batches.filter(b => b.evidence === 'pending').length]] as [string, number][]
    if (role === 'processor') return [['Material processing (kg)', q('processing')], ['Matched, awaiting receipt', c('matched')], ...base.slice(2)] as [string, number][]
    if (role === 'admin') return [['Verification queue', c('evidence_submitted')], ['Open exceptions', c('exception')], ...base.slice(0, 2)] as [string, number][]
    return base
  }, [batches, role])
  const byCat = useMemo(() => Object.entries(batches.reduce<Record<string, number>>((a, b) => ({ ...a, [b.category]: (a[b.category] ?? 0) + b.qty }), {})).map(([name, value]) => ({ name:t(name), value })), [batches, t])
  const tasks = [...batches.filter(b => b.status === 'validated' || b.status === 'registered').slice(0, 2).map(b => ({ t:t('Find a match for {id}', { id:b.id }), to:'/app/matching' })),
    ...batches.filter(b => b.evidence === 'pending').map(b => ({ t:t('Review evidence for {id}', { id:b.id }), to:'/app/tracking' }))]
  const series = flowSeries.map(f => ({ ...f, m:t(f.m), [t('Collected')]:f.collected, [t('Processed')]:f.processed }))
  return (
    <div className="dash">
      <header className="dash__head">
        <div className="dash__intro"><p className="dash__eyebrow">{user?.org}</p><h1>{t('Welcome back, {name}', { name:user?.name ?? t('guest') })}</h1><p className="dash__sub">{t(focus[role])}</p></div>
        <div className="dash__actions"><Select value={role} onChange={v => setRole(v as Role)} label={t('Demo role')} options={Object.keys(focus).map(r => ({ value:r, label:t(r) }))} />
          <button className="dash__btn dash__btn--ghost" onClick={() => nav('/app/materials')}>{t('Register batch')}</button>
          <button className="dash__btn dash__btn--solid" onClick={() => setPickupOpen(true)}><Truck size={16} />{t('Request food waste pickup')}</button>
          <PickupModal open={pickupOpen} onClose={() => setPickupOpen(false)} /></div>
      </header>
      <section className="dash__kpis">{k.map(([l, v]) => <KpiCard key={l} label={t(l)} value={v.toLocaleString()} />)}</section>
      <section className="dash__charts">
        <div className="dash__card"><h3>{t('Material flow (DEMO DATA, tonnes)')}</h3><ResponsiveContainer width="100%" height={220}><AreaChart data={series}><XAxis dataKey="m" /><YAxis /><Tooltip />
          <Area dataKey={t('Collected')} stroke="#123b2a" fill="#b9c9b4" /><Area dataKey={t('Processed')} stroke="#7fe0b0" fill="#c5f26b" fillOpacity={.6} /></AreaChart></ResponsiveContainer></div>
        <div className="dash__card"><h3>{t('Registered kg by category')}</h3><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={byCat} dataKey="value" nameKey="name" innerRadius={50}>{byCat.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </section>
      <section className="dash__lists">
        <div><h3>{t('Pending actions')}</h3>{tasks.length ? tasks.map(x => <Link key={x.t} to={x.to} className="dash__row">{x.t}</Link>) : <p className="dash__empty">{t('Nothing needs attention.')}</p>}</div>
        <div><h3>{t('Recent activity')}</h3>{activity.map(a => <Link key={a.id} to={a.link} className="dash__row">{t(a.text)}<small>{t(a.time)}</small></Link>)}</div>
      </section>
    </div>
  )
}
