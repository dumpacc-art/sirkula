import { useMemo, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import type { Batch } from '../../types'
import './MaterialsPage.css'
const cats = ['Plastic','Paper','Organic','Glass','Metal','Textile','Electronics']
const regions = ['Southeast Asia','Northern Europe','Latin America','East Africa','South Asia']
export default function MaterialsPage() {
  const { batches, matches, addBatch, notify, user } = useStore(); const { t } = useT()
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [st, setSt] = useState(''), [reg, setReg] = useState('')
  const [open, setOpen] = useState(false), [sel, setSel] = useState<Batch | null>(null), [err, setErr] = useState<Record<string,string>>({})
  const [fc, setFc] = useState('Plastic'), [fr, setFr] = useState('Southeast Asia')
  const rows = useMemo(() => batches.filter(b => (!q || (b.id + b.name).toLowerCase().includes(q.toLowerCase())) && (!cat || b.category === cat) && (!st || b.status === st) && (!reg || b.region === reg)), [batches, q, cat, st, reg])
  const statuses = [...new Set(batches.map(b => b.status))]
  const opt = (all: string, list: string[]) => [{ value:'', label:t(all) }, ...list.map(v => ({ value:v, label:t(v.replace(/_/g, ' ')) }))]
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget), x: Record<string,string> = {}
    if (!String(f.get('name')).trim()) x.name = 'Name is required'
    if (!(Number(f.get('qty')) > 0)) x.qty = 'Quantity must be greater than 0'
    if (!String(f.get('pickup')).trim()) x.pickup = 'Pickup location is required'
    setErr(x); if (Object.keys(x).length) return
    addBatch({ name:String(f.get('name')), category:fc, qty:Number(f.get('qty')), unit:'kg', source:user?.org ?? 'Demo Organization', region:fr, evidence:'none' })
    notify('Batch registered'); setOpen(false)
  }
  return (
    <div className="mat">
      <header className="mat__head"><div><h1>{t('Material registry')}</h1><p>{t('{n} of {total} batches · prototype data', { n:rows.length, total:batches.length })}</p></div><button onClick={() => { setErr({}); setOpen(true) }}>+ {t('Register batch')}</button></header>
      <div className="mat__filters">
        <span className="mat__search"><Search size={16} /><input placeholder={t('Search batch ID or name')} value={q} onChange={e => setQ(e.target.value)} /></span>
        <Select value={cat} onChange={setCat} options={opt('All categories', cats)} />
        <Select value={st} onChange={setSt} options={opt('All statuses', statuses)} />
        <Select value={reg} onChange={setReg} options={opt('All regions', regions)} />
        <button className="mat__ghost" onClick={() => { setQ(''); setCat(''); setSt(''); setReg('') }}>{t('Clear')}</button>
      </div>
      {rows.length === 0 ? <div className="mat__empty">{t('No batches match these filters.')}</div> : (
        <div className="mat__scroll"><table><thead><tr><th>ID</th><th>{t('Material')}</th><th>{t('Category')}</th><th>{t('Qty')}</th><th>{t('Source')}</th><th>{t('Region')}</th><th>{t('Status')}</th><th>{t('Created')}</th></tr></thead>
          <tbody>{rows.map(b => <tr key={b.id} onClick={() => setSel(b)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(b)}><td>{b.id}</td><td>{t(b.name)}</td><td>{t(b.category)}</td><td>{b.qty.toLocaleString()} {b.unit}</td><td>{b.source}</td><td>{t(b.region)}</td><td><StatusBadge status={b.status} /></td><td>{b.date}</td></tr>)}</tbody></table></div>)}
      <Modal open={open} title={t('Register material batch')} onClose={() => setOpen(false)}>
        <form className="mat__form" onSubmit={submit} noValidate>
          <label>{t('Material name')}<input name="name" />{err.name && <em>{t(err.name)}</em>}</label>
          <label>{t('Category')}<Select value={fc} onChange={setFc} options={cats.map(c => ({ value:c, label:t(c) }))} /></label>
          <label>{t('Quantity (kg)')}<input name="qty" type="number" step="any" />{err.qty && <em>{t(err.qty)}</em>}</label>
          <label>{t('Region')}<Select value={fr} onChange={setFr} options={regions.map(c => ({ value:c, label:t(c) }))} /></label>
          <label>{t('Pickup location')}<input name="pickup" />{err.pickup && <em>{t(err.pickup)}</em>}</label>
          <button type="submit">{t('Create batch')}</button>
        </form>
      </Modal>
      <Modal open={!!sel} title={sel ? `${sel.id} · ${t(sel.name)}` : ''} onClose={() => setSel(null)}>
        {sel && <dl className="mat__dl"><dt>{t('Category')}</dt><dd>{t(sel.category)}</dd><dt>{t('Quantity')}</dt><dd>{sel.qty} {sel.unit}</dd><dt>{t('Source')}</dt><dd>{sel.source}</dd><dt>{t('Region')}</dt><dd>{t(sel.region)}</dd><dt>{t('Status')}</dt><dd><StatusBadge status={sel.status} /></dd>
          <dt>{t('Matches')}</dt><dd>{matches.filter(m => m.batchId === sel.id).map(m => `${m.processorName} (${t(m.status)})`).join(', ') || t('None yet')}</dd></dl>}
      </Modal>
    </div>
  )
}
