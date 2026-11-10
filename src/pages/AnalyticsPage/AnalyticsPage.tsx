import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area, Legend, CartesianGrid } from 'recharts'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import KpiCard from '../../components/ui/KpiCard'
import { flowSeries } from '../../data/demoData'
import { downloadCsv } from '../../utils/csv'
import { stages } from '../../features/traceability/lifecycle'
import ExtraCharts, { ChartCard } from './ExtraCharts'
import './AnalyticsPage.css'
const col = ['#123b2a','#1b5239','#7fe0b0','#c5f26b','#b9c9b4','#7a807b','#d9a21b']
const idx = (s: string) => stages.findIndex(x => x.key === s)
export default function AnalyticsPage() {
  const { batches, matches, evidence, notify } = useStore(); const { t } = useT()
  const [period, setPeriod] = useState('all'), [reg, setReg] = useState(''), [cat, setCat] = useState('')
  const rows = useMemo(() => { const cut = period === 'all' ? '' : new Date(Date.now() - (period === '30' ? 30 : 90) * 864e5).toISOString().slice(0, 10)
    return batches.filter(b => (!cut || b.date >= cut) && (!reg || b.region === reg) && (!cat || b.category === cat)) }, [batches, period, reg, cat])
  const sum = (f: (b: typeof rows[number]) => boolean) => rows.filter(f).reduce((a, b) => a + b.qty, 0)
  const total = sum(() => true), collected = sum(b => idx(b.status) >= idx('collected')), accepted = sum(b => idx(b.status) >= idx('received')), processed = sum(b => idx(b.status) >= idx('processing')), documented = sum(b => idx(b.status) >= idx('evidence_submitted')), verified = sum(b => idx(b.status) >= idx('verified'))
  const accM = matches.filter(m => m.status === 'accepted').length, rate = matches.length ? Math.round(accM / matches.length * 100) + '%' : '—'
  const evDone = evidence.filter(e => e.status === 'accepted').length
  const pendingEv = rows.filter(b => b.evidence === 'pending').length, openExc = rows.filter(b => b.status === 'exception').length
  const byStage = stages.map(s => ({ name:t(s.label), kg:rows.filter(b => b.status === s.key).reduce((a, b) => a + b.qty, 0) }))
  const byCat = Object.entries(rows.reduce<Record<string, number>>((a, b) => ({ ...a, [b.category]: (a[b.category] ?? 0) + b.qty }), {})).map(([name, value]) => ({ name:t(name), value }))
  const trend = flowSeries.slice(period === '30' ? -2 : period === '90' ? -3 : 0).map(f => ({ m:t(f.m), [t('Collected')]:f.collected, [t('Processed')]:f.processed }))
  const cost = [{ name:t('Transport'), v:42 }, { name:t('Handling'), v:23 }, { name:t('Compliance'), v:15 }, { name:t('Other'), v:20 }]
  const cov = [{ name:t('Verified'), v:rows.filter(b => b.evidence === 'accepted').length }, { name:t('awaiting review'), v:rows.filter(b => b.evidence === 'pending').length }, { name:t('No evidence'), v:rows.filter(b => b.evidence === 'none').length }]
  const ms = [{ name:t('accepted'), v:accM }, { name:t('rejected'), v:matches.length - accM }]
  const exp = () => downloadCsv('sirkula-analytics-demo.csv', rows.map(b => ({ id:b.id, material:b.name, category:b.category, kg:b.qty, province:b.region, status:b.status, date:b.date }))) ? notify('Exported {n} rows', { n:rows.length }) : notify('Nothing to export for these filters')
  return (
    <div className="an">
      <header className="an__head"><span className="an__eyebrow">{t('Analytics')}</span><h1>{t('Impact and analytics')}</h1><p>{t('DEMO DATA. Each batch counts once at its current stage. Collected, processed, documented, and verified quantities are kept separate and not added together.')}</p></header>
      <div className="an__f" role="group" aria-label={t('Filters')}><Select value={period} onChange={setPeriod} options={[{ value:'all', label:t('All time') }, { value:'90', label:t('Last 90 days') }, { value:'30', label:t('Last 30 days') }]} />
        <Select value={reg} onChange={setReg} options={[{ value:'', label:t('All provinces') }, ...[...new Set(batches.map(b => b.region))].map(r => ({ value:r, label:t(r) }))]} />
        <Select value={cat} onChange={setCat} options={[{ value:'', label:t('All categories') }, ...[...new Set(batches.map(b => b.category))].map(r => ({ value:r, label:t(r) }))]} />
        <span className="an__sp" /><button className="ghost" onClick={() => { setPeriod('all'); setReg(''); setCat('') }}>{t('Reset')}</button><button onClick={exp}>{t('Export CSV')}</button></div>
      {rows.length === 0 ? <div className="an__empty">{t('No batches in this selection.')}</div> : <>
        <section className="an__k"><KpiCard label={t('Registered (kg)')} value={total.toLocaleString()} /><KpiCard label={t('Collected or later (kg)')} value={collected.toLocaleString()} /><KpiCard label={t('Accepted by processors (kg)')} value={accepted.toLocaleString()} />
          <KpiCard label={t('Processed (kg)')} value={processed.toLocaleString()} /><KpiCard label={t('Documented utilization (kg)')} value={documented.toLocaleString()} /><KpiCard label={t('Verified (kg)')} value={verified.toLocaleString()} /><KpiCard label={t('Matching acceptance')} value={rate} hint={t('{n} decisions', { n:matches.length })} /><KpiCard label={t('Processing rate')} value={(total ? Math.round(processed / total * 100) : 0) + '%'} /><KpiCard label={t('Average batch (kg)')} value={(rows.length ? Math.round(total / rows.length) : 0).toLocaleString()} />
          <KpiCard label={t('Evidence accepted')} value={evDone} /><KpiCard label={t('Awaiting evidence review')} value={pendingEv} hint={t('batches in this selection')} /><KpiCard label={t('Open exceptions')} value={openExc} hint={t('batches in this selection')} /></section>
        <section className="an__c" aria-label={t('Core charts')}>
          <ChartCard title="Volume by current stage (kg)" hint="Where each kilogram sits in the flow right now."><ResponsiveContainer width="100%" height={250}><BarChart data={byStage}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="kg" fill="#1b5239" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Processing trend (demo, tonnes)" hint="Collected versus processed per month (static demo data)."><ResponsiveContainer width="100%" height={250}><AreaChart data={trend}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Legend /><Area dataKey={t('Collected')} stroke="#123b2a" fill="#b9c9b4" /><Area dataKey={t('Processed')} stroke="#7fe0b0" fill="#c5f26b" /></AreaChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Composition by category" hint="Share of registered weight per waste category."><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={byCat} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>{byCat.map((_, i) => <Cell key={i} fill={col[i % col.length]} />)}</Pie><Tooltip /><Legend iconSize={10} /></PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Matching outcomes" hint="Processor matches accepted versus rejected (prototype-wide).">{matches.length ? <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={ms} dataKey="v" nameKey="name" outerRadius={80}>{ms.map((_, i) => <Cell key={i} fill={col[i * 3]} />)}</Pie><Tooltip /><Legend iconSize={10} /></PieChart></ResponsiveContainer> : <p className="an__none">{t('No match decisions yet. Use SmartMatch.')}</p>}</ChartCard>
          <ChartCard title="Cost breakdown (DEMO %)" hint="Share of cost per activity (static demo data)."><ResponsiveContainer width="100%" height={250}><BarChart data={cost} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} /><Tooltip /><Bar dataKey="v" fill="#7fe0b0" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Evidence coverage (batches)" hint="Batches with verified, pending, or missing evidence."><ResponsiveContainer width="100%" height={250}><BarChart data={cov}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="v" fill="#123b2a" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
        </section>
        <ExtraCharts rows={rows} keys={[t('Collected'), t('Processed')]} trend={trend} stages={byStage.map(x => ({ name: x.name, value: x.kg }))}
          pct={total ? [[t('Collected'), collected], [t('Accepted'), accepted], [t('Processed'), processed], [t('Documented'), documented], [t('Verified'), verified]].map(([name, v]) => ({ name: name as string, value: Math.round(Number(v) / total * 100) })) : []}
          aging={stages.map(st => { const r = rows.filter(b => b.status === st.key); return { name: t(st.label), value: r.length ? Math.round(r.reduce((a, b) => a + (Date.now() - +new Date(b.date)) / 864e5, 0) / r.length) : 0 } })} /></>}
      <small className="an__note">{t('Matching and evidence figures are prototype-wide and ignore the filters above. Trend and cost charts are static demo data. No environmental savings are estimated here.')}</small>
    </div>
  )
}
