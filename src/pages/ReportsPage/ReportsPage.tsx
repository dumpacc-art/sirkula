import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import { weights } from '../../features/traceability/lifecycle'
import { downloadCsv } from '../../utils/csv'
import './ReportsPage.css'
type Rep = { id:string; type:string; region:string; date:string; rows:number; coverage:string }
export default function ReportsPage() {
  const { batches, evidence, orders, notify } = useStore(); const { t } = useT()
  const [type, setType] = useState('batches'), [reg, setReg] = useState(''), [hist, setHist] = useState<Rep[]>([]), [msg, setMsg] = useState('')
  const generate = () => {
    const bs = batches.filter(b => !reg || b.region === reg); let rows: Record<string, string | number>[] = [], coverage = ''
    if (type === 'batches') { rows = bs.map(b => ({ id:b.id, material:b.name, category:b.category, kg:b.qty, region:b.region, status:b.status, pickup_kg:weights[b.id]?.pickup ?? '', received_kg:weights[b.id]?.received ?? '' })); coverage = t('{a} of {b} batches have recorded weights', { a:bs.filter(b => weights[b.id]).length, b:bs.length }) }
    if (type === 'evidence') { const ids = new Set(bs.map(b => b.id)); rows = evidence.filter(e => ids.has(e.batchId)).map(e => ({ id:e.id, batch:e.batchId, note:e.note, status:e.status, by:e.by, date:e.date })); coverage = t('{a} evidence entries for {b} batches', { a:rows.length, b:bs.length }) }
    if (type === 'orders') { rows = orders.map(o => ({ id:o.id, buyer:o.buyer, total_usd:o.total, date:o.date, status:o.status })); coverage = t('All orders (region filter does not apply)') }
    if (!rows.length || !downloadCsv(`sirkula-${type}-demo.csv`, rows)) { setMsg(t('No data for these filters, so no report was produced.')); return }
    setHist([{ id:`R-${hist.length + 1}`, type, region:reg || 'All', date:new Date().toISOString().slice(0, 10), rows:rows.length, coverage }, ...hist]); setMsg(''); notify('Report exported ({n} rows)', { n:rows.length })
  }
  return (
    <div className="rp">
      <header><h1>{t('Reports')}</h1><p>{t('DEMO reports generated from prototype data, exported as CSV.')}</p></header>
      <section className="rp__f"><label>{t('Report')}<Select value={type} onChange={setType} options={[{ value:'batches', label:t('Batch summary') }, { value:'evidence', label:t('Evidence coverage') }, { value:'orders', label:t('Marketplace orders') }]} /></label>
        <label>{t('Region')}<Select value={reg} onChange={setReg} options={[{ value:'', label:t('All regions') }, ...[...new Set(batches.map(b => b.region))].map(r => ({ value:r, label:t(r) }))]} /></label><button onClick={generate}>{t('Generate and export CSV')}</button></section>
      {msg && <p className="rp__warn">{msg}</p>}
      <h3>{t('Recent reports (this session)')}</h3>{hist.length === 0 ? <p className="rp__muted">{t('None generated yet.')}</p> : <table><thead><tr><th>ID</th><th>{t('Type')}</th><th>{t('Region')}</th><th>{t('Date')}</th><th>{t('Rows')}</th><th>{t('Data coverage')}</th></tr></thead><tbody>{hist.map(h => <tr key={h.id}><td>{h.id}</td><td>{t(h.type)}</td><td>{h.region === 'All' ? t('All') : t(h.region)}</td><td>{h.date}</td><td>{h.rows}</td><td>{h.coverage}</td></tr>)}</tbody></table>}
    </div>
  )
}
