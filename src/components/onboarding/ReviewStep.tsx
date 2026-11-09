import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import MapPicker from '../map/MapPicker'
import { WASTE_CATEGORIES, findSub, type Lang } from '../../config/wasteTaxonomy'
import { analyzeSegregation, STREAM_LABEL, WORKFLOW_LABEL, WORKFLOW_HELP } from '../../config/segregation'
import { getBlob } from '../../lib/photos'
import { parseKg, parseBags } from '../../lib/quantity'
import './ReviewStep.css'

/** Pickup › Detail, last part. Shows the full order, checks segregation again, and saves the submission. */
export default function ReviewStep({ onBack, onGoTo, onSubmitted }: { onBack: () => void; onGoTo: (step: number) => void; onSubmitted: (subId: string) => void }) {
  const { onboarding, addSubmission, updateOnboarding, notify } = useStore(); const { t, lang } = useT()
  const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const pickup = onboarding.pickup, photo = onboarding.photo, q = onboarding.quantity
  const ids = onboarding.wasteTypes ?? []
  const seg = analyzeSegregation(ids)
  const kg = parseKg(q.kg)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let alive = true, u: string | null = null
    if (!photo) { setPhotoUrl(null); return }
    getBlob(photo.id).then(b => { if (alive && b) { u = URL.createObjectURL(b); setPhotoUrl(u) } }).catch(() => undefined)
    return () => { alive = false; if (u) URL.revokeObjectURL(u); setPhotoUrl(null) }
  }, [photo?.id])

  const groups = WASTE_CATEGORIES.map(c => ({ c, subs: c.subs.filter(s => ids.includes(s.id)) })).filter(g => g.subs.length)
  const nf = (n: number) => n.toLocaleString(L === 'id' ? 'id-ID' : 'en-US', { maximumFractionDigits: 2 })
  const dateText = q.date ? new Date(q.date + 'T00:00:00').toLocaleDateString(L === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const submit = () => {
    setErr('')
    if (!pickup) return setErr('Pickup location is missing. Go back and set it.')
    if (!seg.valid || !seg.stream || !seg.workflow) return setErr('Split this into separate orders before submitting.')
    if (kg === null) return setErr('Complete the weight before submitting.')
    const subId = addSubmission({ stream: seg.stream, workflow: seg.workflow, wasteTypes: ids, pickup, photo,
      quantity: { kg, bags: parseBags(q.bags), preferredDate: q.date || null, notes: q.notes.trim() } })
    // The next pickup starts fresh at step 1. The saved pickup location stays as a default; photo, waste types and quantity are cleared.
    updateOnboarding({ completed: true, step: 0, draft: null, photo: null, wasteTypes: [], quantity: { kg: '', bags: '', date: '', notes: '' } })
    notify('Order submitted'); onSubmitted(subId)
  }

  return (
    <section className="rv" aria-labelledby="rv-title">
      <header className="rv__head">
        <h2 id="rv-title">{t('Review your order')}</h2>
        <p>{t('Check everything before saving. Use Edit to change a section.')}</p>
      </header>

      <div className="rv__cards">
        <article className="rv__card">
          <div className="rv__ch"><h3>{t('Pickup location')}</h3><button type="button" onClick={() => onGoTo(0)}><Pencil size={13} />{t('Edit')}</button></div>
          {pickup ? <>
            <MapPicker value={{ lat: pickup.lat, lng: pickup.lng }} readOnly height={180} />
            <p className="rv__addr">{pickup.addressText}</p>
            <dl className="rv__dl">
              {pickup.building && <><dt>{t('Building name')}</dt><dd>{pickup.building}</dd></>}
              {pickup.floor && <><dt>{t('Floor')}</dt><dd>{pickup.floor}</dd></>}
              {pickup.landmark && <><dt>{t('Landmark instructions')}</dt><dd>{pickup.landmark}</dd></>}
              <dt>{t('Coordinates')}</dt><dd className="rv__num">{pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)}</dd>
            </dl>
          </> : <p className="rv__muted">{t('Pickup location is missing. Go back and set it.')}</p>}
        </article>

        <article className="rv__card">
          <div className="rv__ch"><h3>{t('Photo')}</h3><button type="button" onClick={() => onGoTo(1)}><Pencil size={13} />{t('Edit')}</button></div>
          {photoUrl ? <img className="rv__photo" src={photoUrl} alt={t('Photo of your waste')} /> : <p className="rv__muted">{t('No photo added')}</p>}
        </article>

        <article className="rv__card rv__card--wide">
          <div className="rv__ch"><h3>{t('Waste categories')}</h3><button type="button" onClick={() => onGoTo(2)}><Pencil size={13} />{t('Edit')}</button></div>
          {groups.length === 0 && <p className="rv__muted">{t('No waste types selected.')}</p>}
          {groups.map(({ c, subs }) => (
            <div key={c.id} className="rv__group">
              <span className={`rv__tag rv__tag--${c.id}`}>{c.label[L]}</span>
              <ul>{subs.map(s => <li key={s.id}>{s.label[L]}</li>)}</ul>
            </div>
          ))}
        </article>

        <article className="rv__card">
          <div className="rv__ch"><h3>{t('Estimated weight')}</h3><button type="button" onClick={() => onGoTo(3)}><Pencil size={13} />{t('Edit')}</button></div>
          <dl className="rv__dl">
            <dt>{t('Estimated total weight (kg)')}</dt><dd className="rv__num">{kg !== null ? `${nf(kg)} kg` : t('Not set')}</dd>
            <dt>{t('Number of bags or containers (optional)')}</dt><dd className="rv__num">{q.bags.trim() || t('Not set')}</dd>
            <dt>{t('Preferred collection date (optional)')}</dt><dd>{dateText || t('Not set')}</dd>
            <dt>{t('Notes for the collector (optional)')}</dt><dd>{q.notes.trim() || t('Not set')}</dd>
          </dl>
        </article>

        <article className={`rv__card rv__seg rv__seg--${seg.valid ? 'ok' : 'bad'}`}>
          <div className="rv__ch"><h3>{t('Segregation status')}</h3></div>
          {seg.valid && seg.stream && seg.workflow ? <>
            <p className="rv__status"><b>{t('Valid: one stream')}</b> · {t(STREAM_LABEL[seg.stream])}</p>
            <p className="rv__muted">{t(WORKFLOW_LABEL[seg.workflow])}: {t(WORKFLOW_HELP[seg.workflow])}</p>
          </> : seg.valid ? <p className="rv__muted">{t('No waste types selected.')}</p> : <>
            <p className="rv__status"><b>{t('Separate order needed')}</b></p>
            <ul>{seg.messages.map(m => <li key={m}>{t(m)}</li>)}</ul>
            <Button variant="secondary" size="sm" onClick={() => onGoTo(2)}>{t('Back to waste types to split the order')}</Button>
          </>}
        </article>
      </div>

      {err && <p className="rv__err" role="alert">{t(err)}</p>}
      <div className="rv__nav">
        <Button variant="ghost" onClick={onBack}>{t('Back')}</Button>
        <Button size="lg" onClick={submit} disabled={!seg.valid || kg === null || !pickup}>{t('Submit order')}</Button>
      </div>
    </section>
  )
}
