import type { ReactNode } from 'react'
import { ResponsiveContainer, RadialBarChart, RadialBar, ComposedChart, Bar, BarChart, Line, XAxis, YAxis, Tooltip, Legend, FunnelChart, Funnel, LabelList, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { useT } from '../../i18n'
import { stages as lifecycle } from '../../features/traceability/lifecycle'

const col = ['#123b2a', '#1b5239', '#2a9a5c', '#7fe0b0', '#c5f26b', '#b9c9b4', '#d9a21b']
type Pt = { name: string; value: number }
type Row = { qty: number; region: string; category: string; evidence?: string; date: string; source: string; status: string }
const sumBy = (rows: Row[], k: (r: Row) => string) => Object.entries(rows.reduce<Record<string, number>>((a, r) => ({ ...a, [k(r)]: (a[k(r)] ?? 0) + r.qty }), {}))

/** Kartu grafik seragam: judul, petunjuk satu baris, area grafik setinggi sama. Dipakai semua grafik supaya baris grid selalu penuh dan rata. */
export function ChartCard({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  const { t } = useT()
  return <div className="an__card"><h3>{t(title)}</h3><p className="an__hint">{t(hint)}</p><div className="an__plot">{children}</div></div>
}
const H = 250
const BUCKETS: [string, (kg: number) => boolean][] = [['< 500 kg', k => k < 500], ['500 – 1.000 kg', k => k >= 500 && k < 1000], ['1.000 – 3.000 kg', k => k >= 1000 && k < 3000], ['> 3.000 kg', k => k >= 3000]]

/** 12 grafik tambahan (jumlahnya sengaja kelipatan 6 supaya grid 3, 2, dan 1 kolom selalu penuh tanpa sisa ruang). */
export default function ExtraCharts({ rows, stages, pct, trend, aging, keys }: { rows: Row[]; stages: Pt[]; pct: Pt[]; trend: Record<string, number | string>[]; aging: Pt[]; keys: [string, string] }) {
  const { t } = useT()
  const radial = pct.map((p, i) => ({ ...p, fill: col[i % col.length] }))
  const funnel = stages.filter(s => s.value > 0).sort((a, b) => b.value - a.value).map((s, i) => ({ ...s, fill: col[i % col.length] }))
  const cum = trend.map((r, i) => ({ ...r, cumulative: trend.slice(0, i + 1).reduce((a, x) => a + Number(x[keys[1]] ?? 0), 0) }))
  const prov = sumBy(rows, r => r.region).map(([name, value]) => ({ name: t(name), value })).sort((a, b) => b.value - a.value).slice(0, 6)
  const cats = [...new Set(rows.map(r => r.category))].map(c => { const r = rows.filter(x => x.category === c); return { name: t(c), [t('Verified')]: r.filter(x => x.evidence === 'accepted').length, [t('awaiting review')]: r.filter(x => x.evidence === 'pending').length, [t('No evidence')]: r.filter(x => x.evidence === 'none').length } })
  const perMonth = Object.entries(rows.reduce<Record<string, { n: number; kg: number }>>((a, r) => { const m = r.date.slice(0, 7); const c = a[m] ?? { n: 0, kg: 0 }; return { ...a, [m]: { n: c.n + 1, kg: c.kg + r.qty } } }, {})).sort().map(([m, v]) => ({ m, batches: v.n, kg: v.kg }))
  const Card = ChartCard
  const sizeDist = BUCKETS.map(([name, f]) => ({ name, value: rows.filter(r => f(r.qty)).length }))
  const topSrc = sumBy(rows, r => r.source).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  const avgCat = [...new Set(rows.map(r => r.category))].map(c => { const r = rows.filter(x => x.category === c); return { name: t(c), value: Math.round(r.reduce((a, x) => a + x.qty, 0) / r.length) } })
  const cumReg = perMonth.map((r, i) => ({ m: r.m, value: perMonth.slice(0, i + 1).reduce((a, x) => a + x.kg, 0) }))
  const stageCount = lifecycle.map(st => ({ name: t(st.label), value: rows.filter(r => r.status === st.key).length })).filter(x => x.value > 0)
  return (
    <section className="an__c" aria-label={t('More charts')}>
      <Card title="Pipeline completion (%)" hint="Share of registered volume that reached each stage."><ResponsiveContainer width="100%" height={H}><RadialBarChart data={radial} innerRadius="25%" outerRadius="100%" startAngle={180} endAngle={0}><RadialBar dataKey="value" background cornerRadius={8} /><Legend iconSize={10} /><Tooltip /></RadialBarChart></ResponsiveContainer></Card>
      <Card title="Stage funnel (kg)" hint="Where volume currently sits in the flow."><ResponsiveContainer width="100%" height={H}><FunnelChart><Tooltip /><Funnel dataKey="value" data={funnel}><LabelList position="right" dataKey="name" fill="#14211a" stroke="none" /></Funnel></FunnelChart></ResponsiveContainer></Card>
      <Card title="Average age per stage (days)" hint="Stages with a high bar are where batches wait the longest."><ResponsiveContainer width="100%" height={H}><BarChart data={aging}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" name={t('Days')} fill="#d9a21b" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Top provinces by volume (kg)" hint="Where most material is registered."><ResponsiveContainer width="100%" height={H}><BarChart data={prov} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={110} /><Tooltip /><Bar dataKey="value" name="kg" fill="#2a9a5c" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Evidence status by category" hint="Which categories still lack verified evidence."><ResponsiveContainer width="100%" height={H}><BarChart data={cats}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey={t('Verified')} stackId="e" fill="#2a9a5c" /><Bar dataKey={t('awaiting review')} stackId="e" fill="#d9a21b" /><Bar dataKey={t('No evidence')} stackId="e" fill="#b9c9b4" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Registrations per month" hint="Number of batches and their total weight."><ResponsiveContainer width="100%" height={H}><ComposedChart data={perMonth}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="m" /><YAxis yAxisId="a" allowDecimals={false} /><YAxis yAxisId="b" orientation="right" /><Tooltip /><Legend /><Bar yAxisId="a" dataKey="batches" name={t('Batches')} fill="#7fe0b0" radius={[8, 8, 0, 0]} /><Line yAxisId="b" dataKey="kg" name="kg" stroke="#123b2a" strokeWidth={3} dot={{ r: 4 }} /></ComposedChart></ResponsiveContainer></Card>
      <Card title="Collected vs processed, cumulative" hint="Gap between the two lines is material still in the pipeline."><ResponsiveContainer width="100%" height={H}><ComposedChart data={cum}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Legend /><Bar dataKey={keys[0]} fill="#b9c9b4" radius={[6, 6, 0, 0]} /><Line dataKey="cumulative" name={t('Cumulative processed')} stroke="#123b2a" strokeWidth={3} dot={{ r: 4 }} /></ComposedChart></ResponsiveContainer></Card>
      <Card title="Batch size distribution" hint="How many batches fall in each weight range."><ResponsiveContainer width="100%" height={H}><BarChart data={sizeDist}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" name={t('Batches')} fill="#1b5239" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Top sources by volume (kg)" hint="Organizations that registered the most material."><ResponsiveContainer width="100%" height={H}><BarChart data={topSrc} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" name="kg" fill="#7fe0b0" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Average batch size by category (kg)" hint="Which categories arrive in the largest lots."><ResponsiveContainer width="100%" height={H}><BarChart data={avgCat}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="value" name="kg" fill="#c5f26b" stroke="#123b2a" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Cumulative registered volume (kg)" hint="Total weight registered, month by month."><ResponsiveContainer width="100%" height={H}><AreaChart data={cumReg}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Area dataKey="value" name="kg" stroke="#123b2a" strokeWidth={2} fill="#7fe0b0" fillOpacity={0.55} /></AreaChart></ResponsiveContainer></Card>
      <Card title="Batches by stage (count)" hint="Number of batches currently in each stage."><ResponsiveContainer width="100%" height={H}><PieChart><Pie data={stageCount} dataKey="value" nameKey="name" innerRadius={42} outerRadius={80}>{stageCount.map((_, i) => <Cell key={i} fill={col[i % col.length]} />)}</Pie><Tooltip /><Legend iconSize={10} /></PieChart></ResponsiveContainer></Card>
    </section>
  )
}
