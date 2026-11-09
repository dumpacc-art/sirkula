import { useEffect, useState } from 'react'
import { useT } from '../../i18n'
import MapPicker from '../map/MapPicker'
import Button from '../ui/Button'
import { getBlob } from '../../lib/photos'
import { parseKg } from '../../lib/quantity'
import { reverse } from '../../lib/geo'
import { WASTE_CATEGORIES, type Lang } from '../../config/wasteTaxonomy'
import { analyzeSegregation, STREAM_LABEL } from '../../config/segregation'
import type { Submission } from '../../types'
import './SubmissionSummary.css'

/** Order summary at the top of SmartMatch. Weight, categories and the pickup pin can be changed; every change is saved. */
export default function SubmissionSummary({ sub, readOnly, onChange }: { sub: Submission; readOnly: boolean; onChange: (patch: Partial<Submission>) => void }) {
  const { t, lang } = useT(); const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const [kgText, setKgText] = useState(String(sub.quantity.kg))
  const [kgErr, setKgErr] = useState(''), [catWarn, setCatWarn] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => { setKgText(String(sub.quantity.kg)); setKgErr('') }, [sub.id, sub.quantity.kg])
  useEffect(() => {
    let alive = true, u: string | null = null
    if (!sub.photo) { setPhotoUrl(null); return }
    getBlob(sub.photo.id).then(b => { if (alive && b) { u = URL.createObjectURL(b); setPhotoUrl(u) } }).catch(() => undefined)
    return () => { alive = false; if (u) URL.revokeObjectURL(u); setPhotoUrl(null) }
  }, [sub.photo?.id])

  const onKg = (v: string) => {
    setKgText(v)
    const n = parseKg(v)
    if (n === null) { setKgErr('Enter the weight in kg (e.g. 12.5)'); return }
    setKgErr('')
    if (n !== sub.quantity.kg) onChange({ quantity: { ...sub.quantity, kg: n } })
  }

  const toggle = (id: string) => {
    const next = sub.wasteTypes.includes(id) ? sub.wasteTypes.filter(x => x !== id) : [...sub.wasteTypes, id]
    if (next.length === 0) { setCatWarn('Pick at least one waste type'); return }
    const seg = analyzeSegregation(next)
    if (!seg.valid || !seg.stream || !seg.workflow) { setCatWarn(seg.messages[0] ?? 'Separate order needed'); return }
    setCatWarn('')
    onChange({ wasteTypes: next, stream: seg.stream, workflow: seg.workflow })
  }

  const movePin = async (p: { lat: number; lng: number }) => {
    onChange({ pickup: { ...sub.pickup, lat: p.lat, lng: p.lng, source: 'map' } })
    const label = await reverse(p)
    onChange({ pickup: { ...sub.pickup, lat: p.lat, lng: p.lng, source: 'map', addressText: label } })
  }

  const dateText = sub.createdAt ? new Date(sub.createdAt).toLocaleString(L === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''

  return (
    <section className="ss" aria-labelledby="ss-title">
      <header className="ss__head">
        <div>
          <h2 id="ss-title">{t('Order summary')} · {sub.id}</h2>
          <p className="ss__meta">{dateText} · {t(STREAM_LABEL[sub.stream])}</p>
        </div>
        {readOnly && <span className="ss__lock">{t('Partner selection is locked while a partner is selected. Cancel it to edit this order.')}</span>}
      </header>

      <div className="ss__grid">
        <div className="ss__col">
          <label className="ss__field">{t('Estimated total weight (kg)')}
            <span className="ss__unit">
              <input inputMode="decimal" value={kgText} disabled={readOnly} onChange={e => onKg(e.target.value)} aria-invalid={!!kgErr} />
              <span aria-hidden="true">kg</span>
            </span>
            {kgErr && <em>{t(kgErr)}</em>}
          </label>

          <div className="ss__field">
            <span>{t('Waste categories')}</span>
            {catWarn && <p className="ss__warn" role="alert">{t(catWarn)}</p>}
            {WASTE_CATEGORIES.map(c => (
              <div key={c.id} className="ss__cat">
                <span className={`ss__tag ss__tag--${c.id}`}>{c.label[L]}</span>
                <div className="ss__chips">
                  {c.subs.map(s => {
                    const on = sub.wasteTypes.includes(s.id)
                    return <button key={s.id} type="button" aria-pressed={on} disabled={readOnly} className={`ss__chip${on ? ' is-on' : ''}`} onClick={() => toggle(s.id)}>{s.label[L]}</button>
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ss__col">
          <div className="ss__field">
            <span>{t('Pickup point')}</span>
            <MapPicker value={sub.pickup} onChange={movePin} readOnly={readOnly} height={240} />
            <p className="ss__hint">{readOnly ? t('Pickup point') : t('Drag the pin or click the map to move the pickup point. Distances update automatically.')}</p>
            <p className="ss__addr">{sub.pickup.addressText}</p>
          </div>
          <div className="ss__field">
            <span>{t('Photo of your waste')}</span>
            {photoUrl ? <img className="ss__photo" src={photoUrl} alt={t('Photo of your waste')} /> : <p className="ss__hint">{t('No photo added')}</p>}
          </div>
        </div>
      </div>
      {readOnly && <Button variant="ghost" size="sm" disabled>{t('Cancel selection')}</Button>}
    </section>
  )
}
