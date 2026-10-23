import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import { stages, stageState, weights } from '../../features/traceability/lifecycle'
import './BatchTrackingPage.css'
export default function BatchTrackingPage() {
  const { batches, evidence, user, addEvidence, reviewEvidence, notify } = useStore(); const { t } = useT()
  const [id, setId] = useState(batches[0]?.id ?? ''), [sel, setSel] = useState(0), [note, setNote] = useState('')
  const b = batches.find(x => x.id === id); const w = weights[id]; const ev = evidence.filter(e => e.batchId === id)
  if (!b) return <div className="bt"><p>{t('No batches yet.')}</p></div>
  const st = stages[sel], state = stageState(b.status, sel), reviewer = user?.role === 'admin'
  return (
    <div className="bt">
      <header><h1>{t('Circular flow tracking')}</h1><p>{t('Collected, processed, documented, and verified are separate states. Collection alone never verifies a batch. Prototype data.')}</p></header>
      <div className="bt__sel"><Select value={id} onChange={v => { setId(v); setSel(0) }} options={batches.map(x => ({ value:x.id, label:`${x.id} · ${t(x.name)}` }))} />
        <span>{b.qty.toLocaleString()} {b.unit} · {b.source} · {t(b.region)}</span><StatusBadge status={b.status} /></div>
      <ol className="bt__tl">{stages.map((s, i) => { const ts = stageState(b.status, i); return (
        <motion.li key={`${id}-${s.key}`} className={`${ts}${i === sel ? ' sel' : ''}`} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i * .06 }}>
          <button onClick={() => setSel(i)}><i>{ts === 'done' ? '✓' : ts === 'exception' ? '!' : i + 1}</i><span>{t(s.label)}</span></button></motion.li>) })}</ol>
      <section className="bt__grid">
        <div className="bt__card"><h3>{t(st.label)}</h3><dl><dt>{t('Event')}</dt><dd>{t(st.event)}</dd><dt>{t('State')}</dt><dd>{t(state)}</dd><dt>{t('Responsible')}</dt><dd>{sel < 3 ? b.source : t(sel < 5 ? 'Transport provider (demo)' : 'Processor (demo)')}</dd>
          <dt>{t('Recorded')}</dt><dd>{state === 'pending' ? t('Not yet recorded') : `${b.date} (+${sel} ${t('d')}, demo)`}</dd><dt>{t('Quantity')}</dt><dd>{b.qty} {b.unit}</dd></dl></div>
        <div className="bt__card"><h3>{t('Weight reconciliation')}</h3>{w ? (<><table><tbody>{(['pickup','received','input','output'] as const).map(k => <tr key={k}><td>{t(k)}</td><td>{w[k].toLocaleString()} kg</td></tr>)}</tbody></table>
          {w.pickup !== w.received && <p className="bt__warn">{t('Discrepancy')}: {w.pickup - w.received} kg. {t(w.note ?? 'Difference between pickup and receiving weight.')}</p>}</>) : <p className="bt__muted">{t('No weights recorded yet.')}</p>}
          <small className="bt__muted">{t('Historical weights are never overwritten.')}</small></div>
        <div className="bt__card"><h3>{t('Traceability QR')}</h3><QRCodeSVG value={`${location.origin}/app/tracking?batch=${id}`} size={96} /><small className="bt__muted">{t('Links to this prototype view. A public, privacy-filtered view is not built yet.')}</small></div>
      </section>
      <section className="bt__card"><h3>{t('Evidence')}</h3>
        {ev.length === 0 ? <p className="bt__muted">{t('No evidence submitted.')}</p> : ev.map(e => <div key={e.id} className="bt__ev"><span>{t(e.note)} · {e.by} · {e.date}</span><StatusBadge status={e.status.replace(' ', '_')} />
          {reviewer && e.status === 'awaiting review' && <span><button onClick={() => { reviewEvidence(e.id, true); notify('Evidence accepted') }}>{t('Approve')}</button> <button className="alt" onClick={() => { reviewEvidence(e.id, false); notify('Evidence rejected') }}>{t('Reject')}</button></span>}</div>)}
        <div className="bt__add"><input placeholder={t('Evidence note or document reference')} value={note} onChange={e => setNote(e.target.value)} />
          <button onClick={() => { if (!note.trim()) { notify('Enter a note first'); return } addEvidence(id, note.trim()); setNote(''); notify('Evidence submitted for review') }}>{t('Submit evidence')}</button></div>
        {!reviewer && <small className="bt__muted">{t('Switch the demo role to admin on the dashboard to review evidence.')}</small>}
      </section>
    </div>
  )
}
