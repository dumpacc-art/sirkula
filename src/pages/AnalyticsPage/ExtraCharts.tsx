import { ResponsiveContainer, RadialBarChart, RadialBar, ComposedChart, Bar, BarChart, Line, XAxis, YAxis, Tooltip, Legend, FunnelChart, Funnel, LabelList, CartesianGrid } from 'recharts'
import { useT } from '../../i18n'

const col = ['#123b2a', '#1b5239', '#2a9a5c', '#7fe0b0', '#c5f26b', '#b9c9b4', '#d9a21b']
type Pt = { name: string; value: number }
type Row = { qty: number; region: string; category: string; evidence: string; date: string }
const sumBy = (rows: Row[], k: (r: Row) => string) => Object.entries(rows.reduce<Record<string, number>>((a, r) => ({ ...a, [k(r)]: (a[k(r)] ?? 0) + r.qty }), {}))

/** Grafik tambahan yang menjawab pertanyaan operasional: seberapa jauh alur, di mana volume, di mana bukti kurang, di mana batch tertahan. */
export default function ExtraCharts({ rows, stages, pct, trend, aging, keys }: { rows: Row[]; stages: Pt[]; pct: Pt[]; trend: Record<string, number | string>[]; aging: Pt[]; keys: [string, string] }) {
  const { t } = useT()
  const radial = pct.map((p, i) => ({ ...p, fill: col[i % col.length] }))
  const funnel = stages.filter(s => s.value > 0).sort((a, b) => b.value - a.value).map((s, i) => ({ ...s, fill: col[i % col.length] }))
  const cum = trend.map((r, i) => ({ ...r, cumulative: trend.slice(0, i + 1).reduce((a, x) => a + Number(x[keys[1]] ?? 0), 0) }))
  const prov = sumBy(rows, r => r.region).map(([name, value]) => ({ name: t(name), value })).sort((a, b) => b.value - a.value).slice(0, 6)
  const cats = [...new Set(rows.map(r => r.category))].map(c => { const r = rows.filter(x => x.category === c); return { name: t(c), [t('Verified')]: r.filter(x => x.evidence === 'accepted').length, [t('awaiting review')]: r.filter(x => x.evidence === 'pending').length, [t('No evidence')]: r.filter(x => x.evidence === 'none').length } })
  const perMonth = Object.entries(rows.reduce<Record<string, { n: number; kg: number }>>((a, r) => { const m = r.date.slice(0, 7); const c = a[m] ?? { n: 0, kg: 0 }; return { ...a, [m]: { n: c.n + 1, kg: c.kg + r.qty } } }, {})).sort().map(([m, v]) => ({ m, batches: v.n, kg: v.kg }))
  const Card = ({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => <div><h3>{t(title)}</h3><p className="an__hint">{t(hint)}</p>{children}</div>
  return (
    <section className="an__c" aria-label={t('More charts')}>
      <Card title="Pipeline completion (%)" hint="Share of registered volume that reached each stage."><ResponsiveContainer width="100%" height={260}><RadialBarChart data={radial} innerRadius="25%" outerRadius="100%" startAngle={180} endAngle={0}><RadialBar dataKey="value" background cornerRadius={8} /><Legend iconSize={10} /><Tooltip /></RadialBarChart></ResponsiveContainer></Card>
      <Card title="Stage funnel (kg)" hint="Where volume currently sits in the flow."><ResponsiveContainer width="100%" height={260}><FunnelChart><Tooltip /><Funnel dataKey="value" data={funnel}><LabelList position="right" dataKey="name" fill="#14211a" stroke="none" /></Funnel></FunnelChart></ResponsiveContainer></Card>
      <Card title="Average age per stage (days)" hint="Stages with a high bar are where batches wait the longest."><ResponsiveContainer width="100%" height={260}><BarChart data={aging}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" name={t('Days')} fill="#d9a21b" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Top provinces by volume (kg)" hint="Where most material is registered."><ResponsiveContainer width="100%" height={260}><BarChart data={prov} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={110} /><Tooltip /><Bar dataKey="value" name="kg" fill="#2a9a5c" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Evidence status by category" hint="Which categories still lack verified evidence."><ResponsiveContainer width="100%" height={260}><BarChart data={cats}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey={t('Verified')} stackId="e" fill="#2a9a5c" /><Bar dataKey={t('awaiting review')} stackId="e" fill="#d9a21b" /><Bar dataKey={t('No evidence')} stackId="e" fill="#b9c9b4" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Registrations per month" hint="Number of batches and their total weight."><ResponsiveContainer width="100%" height={260}><ComposedChart data={perMonth}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="m" /><YAxis yAxisId="a" allowDecimals={false} /><YAxis yAxisId="b" orientation="right" /><Tooltip /><Legend /><Bar yAxisId="a" dataKey="batches" name={t('Batches')} fill="#7fe0b0" radius={[8, 8, 0, 0]} /><Line yAxisId="b" dataKey="kg" name="kg" stroke="#123b2a" strokeWidth={3} dot={{ r: 4 }} /></ComposedChart></ResponsiveContainer></Card>
      <Card title="Collected vs processed, cumulative" hint="Gap between the two lines is material still in the pipeline."><ResponsiveContainer width="100%" height={260}><ComposedChart data={cum}><CartesianGrid vertical={false} stroke="#0000001a" /><XAxis dataKey="m" /><YAxis /><Tooltip /><Legend /><Bar dataKey={keys[0]} fill="#b9c9b4" radius={[6, 6, 0, 0]} /><Line dataKey="cumulative" name={t('Cumulative processed')} stroke="#123b2a" strokeWidth={3} dot={{ r: 4 }} /></ComposedChart></ResponsiveContainer></Card>
    </section>
  )
}
