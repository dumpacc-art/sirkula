import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import { parseKg, bagsValid, localDate, MAX_DAYS_AHEAD, MAX_NOTES } from '../../lib/quantity'
import type { QuantityDetails } from '../../types'
import './QuantityStep.css'

type Errors = Partial<Record<'kg' | 'bags' | 'date', string>>

/** Onboarding step 4. Values are saved on every change. Weight accepts "12.5" or "12,5". */
export default function QuantityStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { onboarding, updateOnboarding } = useStore(); const { t } = useT()
  const q = onboarding.quantity
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof QuantityDetails) => (v: string) => updateOnboarding({ quantity: { ...q, [k]: v } })
  const minDate = localDate(0), maxDate = localDate(MAX_DAYS_AHEAD)

  const next = () => {
    const x: Errors = {}
    if (parseKg(q.kg) === null) x.kg = 'Enter the weight in kg (e.g. 12.5)'
    if (!bagsValid(q.bags)) x.bags = 'Enter a whole number greater than 0'
    if (q.date && (q.date < minDate || q.date > maxDate)) x.date = 'Choose a date within the next 60 days'
    setErr(x)
    if (Object.keys(x).length === 0) onNext()
  }

  return (
    <section className="qty" aria-labelledby="qty-title">
      <header className="qty__head">
        <h2 id="qty-title">{t('Quantity and details')}</h2>
        <p>{t('Tell us roughly how much you have. An estimate is fine; the collector confirms the weight on pickup.')}</p>
      </header>

      <div className="qty__grid">
        <label>{t('Estimated total weight (kg)')}
          <span className="qty__unit">
            <input inputMode="decimal" value={q.kg} onChange={e => set('kg')(e.target.value)} placeholder="12.5" aria-invalid={!!err.kg} aria-describedby="qty-kg-hint" />
            <span aria-hidden="true">kg</span>
          </span>
          <small id="qty-kg-hint">{t('Use a dot or comma for decimals. Do not use thousand separators.')}</small>
          {err.kg && <em>{t(err.kg)}</em>}
        </label>
        <label>{t('Number of bags or containers (optional)')}
          <input inputMode="numeric" value={q.bags} onChange={e => set('bags')(e.target.value)} placeholder="3" aria-invalid={!!err.bags} />
          {err.bags && <em>{t(err.bags)}</em>}
        </label>
        <label>{t('Preferred collection date (optional)')}
          <input type="date" min={minDate} max={maxDate} value={q.date} onChange={e => set('date')(e.target.value)} aria-invalid={!!err.date} />
          {err.date && <em>{t(err.date)}</em>}
        </label>
        <label className="qty__full">{t('Notes for the collector (optional)')}
          <textarea rows={3} maxLength={MAX_NOTES} value={q.notes} onChange={e => set('notes')(e.target.value)}
            placeholder={t('Example: Gate code 1234, ring the bell at the back')} />
          <small className="qty__count">{q.notes.length}/{MAX_NOTES}</small>
        </label>
      </div>

      <div className="qty__nav">
        <Button variant="ghost" onClick={onBack}>{t('Back')}</Button>
        <Button size="lg" onClick={next}>{t('Continue')}</Button>
      </div>
    </section>
  )
}
