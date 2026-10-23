import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import KpiCard from '../../components/ui/KpiCard'
import { flowSeries } from '../../data/demoData'
import { downloadCsv } from '../../utils/csv'
import { stages } from '../../features/traceability/lifecycle'
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
  const byStage = stages.map(s => ({ name:t(s.label), kg:rows.filter(b => b.status === s.key).reduce((a, b) => a + b.qty, 0) }))
  const byCat = Object.entries(rows.reduce<Record<string, number>>((a, b) => ({ ...a, [b.category]: (a[b.category] ?? 0) + b.qty }), {})).map(([name, value]) => ({ name:t(name), value }))
  const trend = flowSeries.slice(period === '30' ? -2 : period === '90' ? -3 : 0).map(f => ({ m:t(f.m), [t('Collected')]:f.collected, [t('Processed')]:f.processed }))
  const cost = [{ name:t('Transport'), v:42 }, { name:t('Handling'), v:23 }, { name:t('Compliance'), v:15 }, { name:t('Other'), v:20 }]
  const cov = [{ name:t('Verified'), v:rows.filter(b => b.evidence === 'accepted').length }, { name:t('awaiting review'), v:rows.filter(b => b.evidence === 'pending').length }, { name:t('No evidence'), v:rows.filter(b => b.evidence === 'none').length }]
  const ms = [{ name:t('accepted'), v:accM }, { name:t('rejected'), v:matches.length - accM }]
  const exp = () => downloadCsv('sirkula-analytics-demo.csv', rows.map(b => ({ id:b.id, material:b.name, category:b.category, kg:b.qty, region:b.region, status:b.status, date:b.date }))) ? notify('Exported {n} rows', { n:rows.length }) : notify('Nothing to export for these filters')
  return (
    <div className="an">
      <header><h1>{t('Impact and analytics')}</h1><p>{t('DEMO DATA. Each batch counts once at its current stage. Collected, processed, documented, and verified quantities are kept separate and not added together.')}</p></header>
      <div className="an__f"><Select value={period} onChange={setPeriod} options={[{ value:'all', label:t('All time') }, { value:'90', label:t('Last 90 days') }, { value:'30', label:t('Last 30 days') }]} />
        <Select value={reg} onChange={setReg} options={[{ value:'', label:t('All regions') }, ...[...new Set(batches.map(b => b.region))].map(r => ({ value:r, label:t(r) }))]} />
        <Select value={cat} onChange={setCat} options={[{ value:'', label:t('All categories') }, ...[...new Set(batches.map(b => b.category))].map(r => ({ value:r, label:t(r) }))]} />
        <button className="ghost" onClick={() => { setPeriod('all'); setReg(''); setCat('') }}>{t('Reset')}</button><button onClick={exp}>{t('Export CSV')}</button></div>
      {rows.length === 0 ? <div className="an__empty">{t('No batches in this selection.')}</div> : <>
        <section className="an__k"><KpiCard label={t('Registered (kg)')} value={total.toLocaleString()} /><KpiCard label={t('Collected or later (kg)')} value={collected.toLocaleString()} /><KpiCard label={t('Accepted by processors (kg)')} value={accepted.toLocaleString()} />
          <KpiCard label={t('Processed (kg)')} value={processed.toLocaleString()} /><KpiCard label={t('Documented utilization (kg)')} value={documented.toLocaleString()} /><KpiCard label={t('Verified (kg)')} value={verified.toLocaleString()} /><KpiCard label={t('Matching acceptance')} value={rate} hint={t('{n} decisions', { n:matches.length })} /><KpiCard label={t('Evidence accepted')} value={evDone} /></section>
        <section className="an__c">
          <div><h3>{t('Volume by current stage (kg)')}</h3><ResponsiveContainer width="100%" height={240}><BarChart data={byStage}><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="kg" fill="#1b5239" /></BarChart></ResponsiveContainer></div>
          <div><h3>{t('Processing trend (demo, tonnes)')}</h3><ResponsiveContainer width="100%" height={240}><AreaChart data={trend}><XAxis dataKey="m" /><YAxis /><Tooltip /><Area dataKey={t('Collected')} stroke="#123b2a" fill="#b9c9b4" /><Area dataKey={t('Processed')} stroke="#7fe0b0" fill="#c5f26b" /></AreaChart></ResponsiveContainer></div>
          <div><h3>{t('Composition by category')}</h3><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={byCat} dataKey="value" nameKey="name" innerRadius={45}>{byCat.map((_, i) => <Cell key={i} fill={col[i % col.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
          <div><h3>{t('Matching outcomes')}</h3>{matches.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={ms} dataKey="v" nameKey="name">{ms.map((_, i) => <Cell key={i} fill={col[i * 3]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer> : <p className="an__empty">{t('No match decisions yet. Use SmartMatch.')}</p>}</div>
          <div><h3>{t('Cost breakdown (DEMO %)')}</h3><ResponsiveContainer width="100%" height={240}><BarChart data={cost} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} /><Tooltip /><Bar dataKey="v" fill="#7fe0b0" /></BarChart></ResponsiveContainer></div>
          <div><h3>{t('Evidence coverage (batches)')}</h3><ResponsiveContainer width="100%" height={240}><BarChart data={cov}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="v" fill="#123b2a" /></BarChart></ResponsiveContainer></div>
        </section></>}
      <small className="an__note">{t('Matching and evidence figures are prototype-wide and ignore the filters above. Trend and cost charts are static demo data. No environmental savings are estimated here.')}</small>
    </div>
  )
}
