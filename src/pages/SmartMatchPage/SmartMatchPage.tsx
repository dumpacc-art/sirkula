import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import RangeInput from '../../components/ui/RangeInput'
import { findMatches, type Candidate, type Excluded, type Weights } from '../../features/smart-match/matchEngine'
import './SmartMatchPage.css'
const steps = ['Checking material requirements', 'Filtering processors', 'Comparing capacity and location', 'Ranking candidates']
export default function SmartMatchPage() {
  const { batches, processors, matches, acceptMatch, rejectMatch } = useStore(); const { t } = useT()
  const open = batches.filter(b => ['registered','validated'].includes(b.status))
  const [id, setId] = useState(open[0]?.id ?? ''), [w, setW] = useState<Weights>({ distance:40, cost:30, capacity:30 })
  const [step, setStep] = useState(-1), [res, setRes] = useState<{ candidates:Candidate[]; excluded:Excluded[] } | null>(null), [confirm, setConfirm] = useState<string | null>(null)
  const batch = batches.find(b => b.id === id)
  const finish = () => { if (batch) { setRes(findMatches(batch, processors, w)); setStep(-1) } }
  useEffect(() => { if (step < 0) return; if (step >= steps.length) { finish(); return } const tm = setTimeout(() => setStep(s => s + 1), 450); return () => clearTimeout(tm) }, [step]) // eslint-disable-line
  const run = () => { setRes(null); setConfirm(null); setStep(0) }
  return (
    <div className="sm">
      <header><h1>SmartMatch</h1><p>{t('Hard constraints (material acceptance, capacity, service area) exclude processors. Distance, cost, and spare capacity only rank the rest. All values are demo data.')}</p></header>
      <section className="sm__input">
        <label>{t('Batch')}<Select value={id} onChange={v => { setId(v); setRes(null) }} options={open.map(b => ({ value:b.id, label:`${b.id} · ${t(b.name)}` }))} placeholder={t('No batches')} /></label>
        {batch && <p className="sm__facts">{t(batch.category)} · {batch.qty.toLocaleString()} {batch.unit} · {t(batch.region)}</p>}
        {(['distance','cost','capacity'] as const).map(k => <label key={k}>{t('Weight')}: {t(k)} <b className="sm__val">{w[k]}</b><RangeInput min={0} max={100} value={w[k]} onChange={v => setW({ ...w, [k]: v })} label={t(k)} /></label>)}
        <button onClick={run} disabled={!batch || step >= 0}>{t('Find Matches')}</button>
        {open.length === 0 && <p className="sm__muted">{t('No batches are waiting for a match.')}</p>}
      </section>
      <AnimatePresence>{step >= 0 && (
        <motion.div className="sm__anim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          {steps.map((s, i) => <p key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>{i < step ? '✓' : '•'} {t(s)}</p>)}
          <button onClick={finish}>{t('Skip')}</button></motion.div>)}</AnimatePresence>
      {res && (res.candidates.length === 0 ? (
        <div className="sm__empty"><h3>{t('No eligible processor')}</h3>{res.excluded.map(x => <p key={x.processor.id}><b>{x.processor.name}</b>: {t(x.reason)}</p>)}</div>
      ) : (
        <section className="sm__results">{res.candidates.map((c, i) => (
          <motion.article key={c.processor.id} className={`sm__card${i === 0 ? ' top' : ''}`} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i * .12 }}>
            <div className="sm__score">{c.score}</div><h3>{c.processor.name}{i === 0 && <span> · {t('top match')}</span>}</h3>
            <p className="sm__muted">{t(c.processor.region)} · {t('capacity')} {c.processor.capacity} kg</p>
            <ul>{c.reasons.map(r => <li key={r}>{t(r)}</li>)}</ul>
            {c.concerns.map(r => <p key={r} className="sm__concern">⚠ {t(r)}</p>)}
            {confirm === c.processor.id ? <div className="sm__row"><button onClick={() => { if (batch && acceptMatch(batch.id, c.processor.id, c.score)) setRes(null); setConfirm(null) }}>{t('Confirm accept')}</button><button className="alt" onClick={() => setConfirm(null)}>{t('Cancel')}</button></div>
              : <div className="sm__row"><button onClick={() => setConfirm(c.processor.id)}>{t('Accept')}</button><button className="alt" onClick={() => { if (batch) rejectMatch(batch.id, c.processor.id); setRes({ ...res, candidates:res.candidates.filter(x => x !== c) }) }}>{t('Reject')}</button></div>}
          </motion.article>))}</section>))}
      <section><h3>{t('Match history')}</h3>{matches.length === 0 ? <p className="sm__muted">{t('No decisions yet.')}</p> : matches.map(m => <p key={m.id} className="sm__hist">{m.date} · {m.batchId} → {m.processorName} · <b>{t(m.status)}</b>{m.status === 'accepted' && ` (${t('score')} ${m.score})`}</p>)}</section>
    </div>
  )
}
