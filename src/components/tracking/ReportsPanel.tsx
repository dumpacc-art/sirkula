import { useMemo, useState } from 'react'
import { Boxes, ShieldCheck, ShoppingBag, FileDown, FileText, Rows3, CalendarClock } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../ui/Select'
import { weights } from '../../features/traceability/lifecycle'
import { downloadCsv } from '../../utils/csv'
import { formatDate } from '../../utils/format'
import { demoReportHistory } from '../../data/demoData'
import './ReportsPanel.css'

type Kind = 'batches' | 'evidence' | 'orders'
interface Rep { id: string; type: Kind; region: string; date: string; rows: number; coverage: string; by: string; size: string; fresh?: boolean }
const KINDS: { key: Kind; title: string; desc: string; Icon: typeof Boxes }[] = [
  { key: 'batches', title: 'Batch summary', desc: 'Per-batch weights, status and province.', Icon: Boxes },
  { key: 'evidence', title: 'Evidence coverage', desc: 'Evidence entries and review status.', Icon: ShieldCheck },
  { key: 'orders', title: 'Marketplace orders', desc: 'Orders placed in the marketplace.', Icon: ShoppingBag },
]
const ICON: Record<Kind, typeof Boxes> = { batches: Boxes, evidence: ShieldCheck, orders: ShoppingBag }

/** Orders › Reports. Riwayat awal bersifat FIKTIF (demo); laporan baru dibuat dari data prototipe dan ditambahkan di atasnya. */
export default function ReportsPanel() {
  const { batches, evidence, orders, notify, user } = useStore(); const { t, lang } = useT()
  const [type, setType] = useState<Kind>('batches'), [reg, setReg] = useState(''), [filter, setFilter] = useState<'all' | Kind>('all')
  const [made, setMade] = useState<Rep[]>([]), [msg, setMsg] = useState('')
  const all = useMemo<Rep[]>(() => [...made, ...demoReportHistory], [made])

  const build = (k: Kind, region: string) => {
    const bs = batches.filter(b => !region || b.region === region); let rows: Record<string, string | number>[] = [], coverage = ''
    if (k === 'batches') { rows = bs.map(b => ({ id: b.id, material: b.name, category: b.category, kg: b.qty, province: b.region, status: b.status, pickup_kg: weights[b.id]?.pickup ?? '', received_kg: weights[b.id]?.received ?? '' })); coverage = t('{a} of {b} batches have recorded weights', { a: bs.filter(b => weights[b.id]).length, b: bs.length }) }
    if (k === 'evidence') { const ids = new Set(bs.map(b => b.id)); rows = evidence.filter(e => ids.has(e.batchId)).map(e => ({ id: e.id, batch: e.batchId, note: e.note, status: e.status, by: e.by, date: e.date })); coverage = t('{a} evidence entries for {b} batches', { a: rows.length, b: bs.length }) }
    if (k === 'orders') { rows = orders.map(o => ({ id: o.id, buyer: o.buyer, total_idr: o.total, date: o.date, status: o.status })); coverage = t('All orders (province filter does not apply)') }
    return { rows, coverage }
  }
  const generate = () => {
    const { rows, coverage } = build(type, reg)
    if (!rows.length || !downloadCsv(`sirkula-${type}-demo.csv`, rows)) { setMsg(t('No data for these filters, so no report was produced.')); return }
    const n = 113 + made.length
    setMade([{ id: `R-${String(n).padStart(4, '0')}`, type, region: reg || 'All', date: new Date().toISOString().slice(0, 10), rows: rows.length, coverage, by: user?.name ?? '—', size: `${Math.max(0.4, rows.length * 0.18).toFixed(1)} KB`, fresh: true }, ...made])
    setMsg(''); notify('Report exported ({n} rows)', { n: rows.length })
  }
  const again = (r: Rep) => {
    const { rows } = build(r.type, r.region === 'All' ? '' : r.region)
    if (!rows.length || !downloadCsv(`sirkula-${r.type}-${r.id}.csv`, rows)) { setMsg(t('No data for these filters, so no report was produced.')); return }
    setMsg(''); notify('Report exported ({n} rows)', { n: rows.length })
  }

  const list = all.filter(r => filter === 'all' || r.type === filter)
  const totalRows = all.reduce((a, r) => a + r.rows, 0)
  const counts: Record<string, number> = { all: all.length, batches: 0, evidence: 0, orders: 0 }; all.forEach(r => { counts[r.type]++ })
  const last = all[0]

  return (
    <div className="rp">
      <section className="rp__stats" aria-label={t('Reports')}>
        <div><span className="rp__si"><FileText size={16} aria-hidden="true" /></span><small>{t('Reports generated')}</small><strong>{all.length}</strong></div>
        <div><span className="rp__si"><Rows3 size={16} aria-hidden="true" /></span><small>{t('Rows exported')}</small><strong>{totalRows.toLocaleString('id-ID')}</strong></div>
        <div><span className="rp__si"><CalendarClock size={16} aria-hidden="true" /></span><small>{t('Last report')}</small><strong>{last ? formatDate(last.date, lang) : '—'}</strong></div>
      </section>

      <section className="rp__gen">
        <div className="rp__genHead"><h3>{t('Generate a report')}</h3><p>{t('Choose the report type and province, then export it as CSV.')}</p></div>
        <div className="rp__kinds" role="radiogroup" aria-label={t('Report')}>
          {KINDS.map(({ key, title, desc, Icon }) => (
            <button key={key} type="button" role="radio" aria-checked={type === key} className={`rp__kind${type === key ? ' on' : ''}`} onClick={() => setType(key)}>
              <span className="rp__kindIcon"><Icon size={20} aria-hidden="true" /></span><b>{t(title)}</b><small>{t(desc)}</small>
            </button>
          ))}
        </div>
        <div className="rp__row">
          <label>{t('Province')}<Select value={reg} onChange={setReg} options={[{ value: '', label: t('All provinces') }, ...[...new Set(batches.map(b => b.region))].map(r => ({ value: r, label: t(r) }))]} /></label>
          <button type="button" className="rp__go" onClick={generate}><FileDown size={16} aria-hidden="true" />{t('Generate and export CSV')}</button>
        </div>
        {msg && <p className="rp__warn" role="status">{msg}</p>}
      </section>

      <section className="rp__hist">
        <div className="rp__histHead">
          <h3>{t('Report history')}</h3>
          <div className="rp__chips" role="tablist" aria-label={t('Report history')}>
            {(['all', 'batches', 'evidence', 'orders'] as const).map(k => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} className={`rp__chip${filter === k ? ' on' : ''}`} onClick={() => setFilter(k)}>{k === 'all' ? t('All types') : t(k === 'batches' ? 'Batch summary' : k === 'evidence' ? 'Evidence coverage' : 'Marketplace orders')}<i>{counts[k]}</i></button>
            ))}
          </div>
        </div>
        {list.length === 0 ? <p className="rp__empty">{t('No reports match this filter.')}</p> : (
          <ul className="rp__list">
            {list.map(r => { const Icon = ICON[r.type]; return (
              <li key={r.id} className={`rp__item${r.fresh ? ' fresh' : ''}`}>
                <span className="rp__itemIcon"><Icon size={18} aria-hidden="true" /></span>
                <div className="rp__main">
                  <p><b>{t(KINDS.find(k => k.key === r.type)!.title)}</b>{r.fresh && <em>{t('This session')}</em>}</p>
                  <small>{r.id} · {r.region === 'All' ? t('All provinces') : t(r.region)} · {formatDate(r.date, lang)}</small>
                  <small className="rp__cov">{t(r.coverage)}</small>
                </div>
                <dl className="rp__meta">
                  <div><dt>{t('Rows')}</dt><dd>{r.rows}</dd></div>
                  <div><dt>{t('Size')}</dt><dd>{r.size}</dd></div>
                  <div><dt>{t('Generated by')}</dt><dd>{t(r.by)}</dd></div>
                </dl>
                <button type="button" className="rp__dl" onClick={() => again(r)} aria-label={`${t('Download again')} ${r.id}`} title={t('Re-exported from current data')}><FileDown size={16} aria-hidden="true" /><span>{t('Download again')}</span></button>
              </li>) })}
          </ul>
        )}
      </section>
    </div>
  )
}
