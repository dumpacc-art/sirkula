import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Search, Plus, LayoutGrid, Rows3, Recycle, Newspaper, Leaf, GlassWater, Wrench, Shirt, Cpu, Package, Scale, Loader, BadgeCheck, TriangleAlert, MapPin, Check, type LucideIcon } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import type { Batch } from '../../types'
import { PROVINCE_NAMES, DEFAULT_PROVINCE } from '../../config/provinces'
import { stages, stageState, weights, EXCEPTION_AT } from '../../features/traceability/lifecycle'
import { formatDate } from '../../utils/format'
import './MaterialsPage.css'

const cats = ['Plastic', 'Paper', 'Organic', 'Glass', 'Metal', 'Textile', 'Electronics']
const CAT: Record<string, { Icon: LucideIcon; hue: string }> = {
  Plastic: { Icon: Recycle, hue: '#0e7490' }, Paper: { Icon: Newspaper, hue: '#a16207' }, Organic: { Icon: Leaf, hue: '#15803d' }, Glass: { Icon: GlassWater, hue: '#0369a1' },
  Metal: { Icon: Wrench, hue: '#475569' }, Textile: { Icon: Shirt, hue: '#9d174d' }, Electronics: { Icon: Cpu, hue: '#6d28d9' },
}
const DONE = ['received', 'processing', 'evidence_submitted', 'verified', 'completed']
const nf = (n: number) => n.toLocaleString('id-ID')
const pct = (b: Batch) => { const i = b.status === 'exception' ? EXCEPTION_AT : Math.max(0, stages.findIndex(s => s.key === b.status)); return Math.round(i / (stages.length - 1) * 100) }

export default function MaterialsPage() {
  const { batches, matches, addBatch, notify, user } = useStore(); const { t, lang } = useT()
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [st, setSt] = useState(''), [reg, setReg] = useState('')
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [open, setOpen] = useState(false), [sel, setSel] = useState<Batch | null>(null), [err, setErr] = useState<Record<string, string>>({})
  const [fc, setFc] = useState('Plastic'), [fr, setFr] = useState(DEFAULT_PROVINCE)
  const [dq, setDq] = useState('')
  useEffect(() => { const id = window.setTimeout(() => setDq(q), 250); return () => window.clearTimeout(id) }, [q])

  const rows = useMemo(() => batches.filter(b => (!dq || (b.id + b.name + b.source).toLowerCase().includes(dq.toLowerCase())) && (!cat || b.category === cat) && (!st || b.status === st) && (!reg || b.region === reg)), [batches, dq, cat, st, reg])
  const stat = useMemo(() => ({
    kg: batches.reduce((a, b) => a + b.qty, 0),
    live: batches.filter(b => !DONE.includes(b.status) && !['rejected', 'exception'].includes(b.status)).length,
    done: batches.filter(b => ['verified', 'completed'].includes(b.status)).length,
    attn: batches.filter(b => b.status === 'exception' || b.status === 'rejected' || b.evidence === 'pending').length,
  }), [batches])
  const catCount = (c: string) => batches.filter(b => b.category === c).length
  const statuses = [...new Set(batches.map(b => b.status))], provinces = [...new Set(batches.map(b => b.region))]
  const opt = (all: string, list: string[]) => [{ value: '', label: t(all) }, ...list.map(v => ({ value: v, label: t(v.replace(/_/g, ' ')) }))]
  const filtered = !!(q || cat || st || reg)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget), x: Record<string, string> = {}
    if (!String(f.get('name')).trim()) x.name = 'Name is required'
    if (!(Number(f.get('qty')) > 0)) x.qty = 'Quantity must be greater than 0'
    setErr(x); if (Object.keys(x).length) return
    addBatch({ name: String(f.get('name')), category: fc, qty: Number(f.get('qty')), unit: 'kg', source: user?.org ?? 'Organisasi Demo', region: fr, evidence: 'none' })
    notify('Batch registered'); setOpen(false)
  }
  const Cat = ({ c, size = 20 }: { c: string; size?: number }) => { const m = CAT[c] ?? { Icon: Package, hue: '#475569' }; return <span className="mt__cat" style={{ '--h': m.hue } as CSSProperties}><m.Icon size={size} aria-hidden="true" /></span> }
  const w = sel ? weights[sel.id] : undefined

  return (
    <div className="mt">
      <header className="mt__head">
        <div><h1>{t('Material registry')}</h1><p>{t('{n} of {total} batches · prototype data', { n: rows.length, total: batches.length })}</p></div>
        <button type="button" className="mt__add" onClick={() => { setErr({}); setOpen(true) }}><Plus size={16} aria-hidden="true" />{t('Register batch')}</button>
      </header>

      <section className="mt__stats">
        <div><span className="mt__si"><Scale size={16} aria-hidden="true" /></span><small>{t('Total volume')}</small><strong>{nf(stat.kg)} kg</strong></div>
        <div><span className="mt__si"><Loader size={16} aria-hidden="true" /></span><small>{t('In process')}</small><strong>{stat.live}</strong></div>
        <div><span className="mt__si"><BadgeCheck size={16} aria-hidden="true" /></span><small>{t('Completed or verified')}</small><strong>{stat.done}</strong></div>
        <div className={stat.attn ? 'warn' : ''}><span className="mt__si"><TriangleAlert size={16} aria-hidden="true" /></span><small>{t('Needs attention')}</small><strong>{stat.attn}</strong></div>
      </section>

      <div className="mt__chips" role="tablist" aria-label={t('Category')}>
        <button type="button" role="tab" aria-selected={!cat} className={`mt__chip${!cat ? ' on' : ''}`} onClick={() => setCat('')}>{t('All')}<i>{batches.length}</i></button>
        {cats.filter(c => catCount(c)).map(c => <button key={c} type="button" role="tab" aria-selected={cat === c} className={`mt__chip${cat === c ? ' on' : ''}`} onClick={() => setCat(cat === c ? '' : c)}>{t(c)}<i>{catCount(c)}</i></button>)}
      </div>

      <div className="mt__bar">
        <span className="mt__search"><Search size={16} aria-hidden="true" /><input placeholder={t('Search batch ID or name')} value={q} onChange={e => setQ(e.target.value)} aria-label={t('Search batch ID or name')} /></span>
        <Select value={st} onChange={setSt} options={opt('All statuses', statuses)} />
        <Select value={reg} onChange={setReg} options={opt('All provinces', provinces)} />
        {filtered && <button type="button" className="mt__ghost" onClick={() => { setQ(''); setCat(''); setSt(''); setReg('') }}>{t('Clear')}</button>}
        <div className="mt__view" role="group" aria-label={t('View')}>
          <button type="button" aria-pressed={view === 'cards'} className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')} title={t('Cards')}><LayoutGrid size={16} aria-hidden="true" /></button>
          <button type="button" aria-pressed={view === 'table'} className={view === 'table' ? 'on' : ''} onClick={() => setView('table')} title={t('Table')}><Rows3 size={16} aria-hidden="true" /></button>
        </div>
      </div>

      {rows.length === 0 ? <div className="mt__empty">{t('No batches match these filters.')}</div> : view === 'cards' ? (
        <ul className="mt__grid">
          {rows.map(b => (
            <li key={b.id}>
              <button type="button" className="mt__card" onClick={() => setSel(b)}>
                <span className="mt__cardTop"><Cat c={b.category} /><span className="mt__cardId"><b>{t(b.name)}</b><small>{b.id} · {t(b.category)}</small></span><StatusBadge status={b.status} /></span>
                <span className="mt__qty">{nf(b.qty)}<small> {b.unit}</small></span>
                <span className="mt__src">{b.source}</span>
                <span className="mt__prog" aria-hidden="true"><i className={b.status === 'exception' || b.status === 'rejected' ? 'bad' : ''} style={{ width: `${pct(b)}%` }} /></span>
                <span className="mt__foot"><span><MapPin size={12} aria-hidden="true" />{t(b.region)}</span><span>{formatDate(b.date, lang)}</span></span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt__scroll"><table><thead><tr><th>ID</th><th>{t('Material')}</th><th>{t('Qty')}</th><th>{t('Source')}</th><th>{t('Province')}</th><th>{t('Progress')}</th><th>{t('Status')}</th><th>{t('Created')}</th></tr></thead>
          <tbody>{rows.map(b => <tr key={b.id} onClick={() => setSel(b)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(b)}>
            <td className="mono">{b.id}</td><td><span className="mt__cell"><Cat c={b.category} size={15} />{t(b.name)}</span></td><td className="num">{nf(b.qty)} {b.unit}</td><td>{b.source}</td><td>{t(b.region)}</td>
            <td><span className="mt__prog mt__prog--sm" aria-hidden="true"><i className={b.status === 'exception' ? 'bad' : ''} style={{ width: `${pct(b)}%` }} /></span></td><td><StatusBadge status={b.status} /></td><td>{formatDate(b.date, lang)}</td></tr>)}</tbody></table></div>
      )}

      <Modal open={open} title={t('Register material batch')} onClose={() => setOpen(false)}>
        <form className="mt__form" onSubmit={submit} noValidate>
          <label>{t('Material name')}<input name="name" />{err.name && <em>{t(err.name)}</em>}</label>
          <label>{t('Category')}<Select value={fc} onChange={setFc} options={cats.map(c => ({ value: c, label: t(c) }))} /></label>
          <label>{t('Quantity (kg)')}<input name="qty" type="number" step="any" />{err.qty && <em>{t(err.qty)}</em>}</label>
          <label>{t('Province')}<Select value={fr} onChange={setFr} options={PROVINCE_NAMES.map(c => ({ value: c, label: c }))} /></label>
          <button type="submit">{t('Create batch')}</button>
        </form>
      </Modal>

      <Modal open={!!sel} title={sel ? `${sel.id} · ${t(sel.name)}` : ''} onClose={() => setSel(null)}>
        {sel && <div className="mt__detail">
          <dl className="mt__dl"><dt>{t('Category')}</dt><dd>{t(sel.category)}</dd><dt>{t('Quantity')}</dt><dd>{nf(sel.qty)} {sel.unit}</dd><dt>{t('Source')}</dt><dd>{sel.source}</dd><dt>{t('Province')}</dt><dd>{t(sel.region)}</dd><dt>{t('Status')}</dt><dd><StatusBadge status={sel.status} /></dd><dt>{t('Registered on')}</dt><dd>{formatDate(sel.date, lang)}</dd>
            <dt>{t('Matches')}</dt><dd>{matches.filter(m => m.batchId === sel.id).map(m => `${m.processorName} (${t(m.status)})`).join(', ') || t('None yet')}</dd></dl>
          {w && <div className="mt__w"><h4>{t('Weights')}</h4><div><span><small>{t('At pickup')}</small><b>{nf(w.pickup)} kg</b></span><span><small>{t('At receiving')}</small><b>{nf(w.received)} kg</b></span></div>{w.note && <p>{t(w.note)}</p>}</div>}
          <h4>{t('Lifecycle')}</h4>
          <ol className="mt__tl">{stages.map((s, i) => { const state = stageState(sel.status, i); return <li key={s.key} className={state}><i>{state === 'done' ? <Check size={11} aria-hidden="true" /> : null}</i><span>{t(s.label)}</span></li> })}</ol>
        </div>}
      </Modal>
    </div>
  )
}
