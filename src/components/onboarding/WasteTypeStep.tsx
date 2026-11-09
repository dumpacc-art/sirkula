import { useMemo, useState, type KeyboardEvent } from 'react'
import { Check, Search, X } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import { WASTE_CATEGORIES, findSub, matchesSub, normalize, type Lang, type WasteCategory } from '../../config/wasteTaxonomy'
import { analyzeSegregation } from '../../config/segregation'
import './WasteTypeStep.css'

/** Onboarding step 3. Users pick sub-categories; search filters across labels, examples and keywords. Selection is saved on every change. */
export default function WasteTypeStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { onboarding, updateOnboarding } = useStore(); const { t, lang } = useT()
  const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const selected = onboarding.wasteTypes ?? []
  const [q, setQ] = useState(''); const [err, setErr] = useState('')
  const query = normalize(q)
  const total = WASTE_CATEGORIES.reduce((n, c) => n + c.subs.length, 0)
  const seg = analyzeSegregation(selected)

  const groups = useMemo(() => WASTE_CATEGORIES
    .map(c => ({ ...c, subs: c.subs.filter(s => !query || matchesSub(s, query)) }))
    .filter(c => c.subs.length > 0), [query])
  const shown = groups.reduce((n, g) => n + g.subs.length, 0)

  const toggle = (id: string) => {
    setErr('')
    updateOnboarding({ wasteTypes: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] })
  }
  const next = () => {
    if (selected.length === 0) { setErr('Pick at least one waste type'); return }
    if (!seg.valid) { setErr('Split this into separate orders before continuing.'); return }
    onDone()
  }
  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Escape') setQ('') }

  return (
    <section className="wst" aria-labelledby="wst-title">
      <header className="wst__head">
        <h2 id="wst-title">{t('Select the waste types in your pickup')}</h2>
        <p>{t('Pick every type you have. If unsure, choose the closest category; our team verifies on pickup.')}</p>
      </header>

      <div className="wst__search">
        <Search size={16} aria-hidden="true" />
        <input type="search" role="searchbox" value={q} onChange={e => setQ(e.target.value)} onKeyDown={onSearchKey}
          placeholder={t('Search waste types (e.g. bottle, battery)')} aria-label={t('Search waste types')} aria-controls="wst-list" />
        {q && <button type="button" className="wst__clear" onClick={() => setQ('')} aria-label={t('Clear search')}><X size={14} /></button>}
      </div>
      <p className="wst__count" aria-live="polite">{t('{shown} of {total} types', { shown, total })}</p>

      {selected.length > 0 && (
        <div className="wst__selected" aria-label={t('Selected ({n})', { n: selected.length })}>
          <span className="wst__selLabel">{t('Selected ({n})', { n: selected.length })}</span>
          <ul>
            {selected.map(id => { const f = findSub(id); return f ? (
              <li key={id}><button type="button" onClick={() => toggle(id)} aria-label={`${t('Remove')} ${f.sub.label[L]}`}>
                {f.sub.label[L]}<X size={12} aria-hidden="true" /></button></li>
            ) : null })}
          </ul>
          <button type="button" className="wst__all" onClick={() => updateOnboarding({ wasteTypes: [] })}>{t('Clear all')}</button>
        </div>
      )}

      <div id="wst-list" className="wst__groups">
        {groups.length === 0 && (
          <div className="wst__empty" role="status">
            <p>{t('No types match. Try another word or clear the search.')}</p>
            <Button variant="secondary" size="sm" onClick={() => setQ('')}>{t('Clear search')}</Button>
          </div>
        )}
        {groups.map((g: WasteCategory & { subs: WasteCategory['subs'] }) => (
          <fieldset key={g.id} className={`wst__cat wst__cat--${g.id}`}>
            <legend>{g.label[L]}</legend>
            <p className="wst__hint">{g.hint[L]}</p>
            <div className="wst__chips">
              {g.subs.map(s => {
                const on = selected.includes(s.id)
                return (
                  <button key={s.id} type="button" aria-pressed={on} className={`wst__chip${on ? ' is-on' : ''}`} onClick={() => toggle(s.id)}>
                    <span className="wst__chipTop"><b>{s.label[L]}</b>{on && <Check size={14} aria-hidden="true" />}</span>
                    <small>{s.examples[L]}</small>
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {!seg.valid && (
        <div className="wst__warn" role="alert">
          <b>{t('Separate order needed')}</b>
          <ul>{seg.messages.map(m => <li key={m}>{t(m)}</li>)}</ul>
          <p>{t('Keep one group per order. Remove the other group now and submit it as a separate order afterwards.')}</p>
        </div>
      )}
      {err && <p className="wst__err" role="alert">{t(err)}</p>}
      <div className="wst__nav">
        <Button variant="ghost" onClick={onBack}>{t('Back')}</Button>
        <Button size="lg" onClick={next}>{t('Finish')}</Button>
      </div>
    </section>
  )
}
