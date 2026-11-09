import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Star, MapPin, Wallet, Gauge, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useT } from '../../i18n'
import RangeInput from '../ui/RangeInput'
import { SkeletonCard } from '../ui/Skeleton'
import { findSub, type Lang } from '../../config/wasteTaxonomy'
import type { Availability, PartnerEvaluation, RuleWeights, Issue } from '../../features/smart-match/rules'
import { materialFit } from '../../features/smart-match/recommend'
import { formatIdr, type Quote } from '../../features/pricing/collectionPrice'
import './PartnerList.css'

const AVAIL: Record<Availability, { label: string; tone: 'ok' | 'warn' | 'bad' }> = {
  available: { label: 'Available', tone: 'ok' },
  area: { label: 'Outside service area', tone: 'bad' },
  quota: { label: 'Quota full', tone: 'warn' },
  material: { label: 'Material not accepted', tone: 'bad' },
}
type Sort = 'best' | 'price' | 'distance' | 'rating'
const SORTS: [Sort, string][] = [['best', 'Best match'], ['price', 'Lowest price'], ['distance', 'Nearest'], ['rating', 'Top rated']]

/** Partner list. Unavailable or unpriced partners stay visible with the reason their select button is disabled. While `loading`, placeholder cards hold the space. */
export default function PartnerList({ evals, quotes, recommendedId, weights, setWeights, locked, selectedId, kg, orderTypes, loading, onSelect }: {
  evals: PartnerEvaluation[]; quotes: Record<string, Quote>; recommendedId: string | null
  weights: RuleWeights; setWeights: (w: RuleWeights) => void; locked: boolean
  selectedId?: string; kg: number; orderTypes: string[]; loading: boolean
  onSelect: (e: PartnerEvaluation, priceIdr?: number) => void
}) {
  const { t, lang } = useT(); const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const [sort, setSort] = useState<Sort>('best'), [onlyAvail, setOnlyAvail] = useState(false), [adv, setAdv] = useState(false)
  const subLabel = (id: string) => findSub(id)?.sub.label[L] ?? id
  const reason = (i: Issue): string => {
    if (i.kind === 'material') return t('Does not accept: {items}', { items: i.missing.map(subLabel).join(', ') })
    if (i.kind === 'area') return t('Outside the service area: {km} km away, coverage {radius} km', { km: i.km, radius: i.radius })
    return t('Quota left {left} kg, this order needs {kg} kg', { left: Math.round(i.left * 10) / 10, kg })
  }
  const anyAvailable = evals.some(e => e.availability === 'available')
  const total = (e: PartnerEvaluation) => { const q = quotes[e.partner.id]; return q?.status === 'ok' ? q.breakdown.total : Infinity }

  const rows = useMemo(() => {
    const list = evals.map((e, i) => ({ e, i })).filter(x => !onlyAvail || x.e.availability === 'available')
    const up = (x: { e: PartnerEvaluation }) => (x.e.availability === 'available' ? 0 : 1)
    const key: Record<Sort, (a: { e: PartnerEvaluation; i: number }, b: { e: PartnerEvaluation; i: number }) => number> = {
      best: (a, b) => Number(b.e.partner.id === recommendedId) - Number(a.e.partner.id === recommendedId) || a.i - b.i,
      price: (a, b) => total(a.e) - total(b.e) || a.i - b.i,
      distance: (a, b) => a.e.distanceKm - b.e.distanceKm || a.i - b.i,
      rating: (a, b) => b.e.partner.rating - a.e.partner.rating || a.i - b.i,
    }
    return list.sort((a, b) => up(a) - up(b) || key[sort](a, b)).map(x => x.e)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evals, quotes, sort, onlyAvail, recommendedId])

  return (
    <section className="pl" aria-labelledby="pl-title">
      <header className="pl__head">
        <div><h2 id="pl-title">{t('Partners')}</h2><p>{t('Demo partners are fictional and for demonstration only.')}</p></div>
        <div className="pl__tools">
          <div className="pl__seg" role="group" aria-label={t('Sort partners')}>
            {SORTS.map(([k, label]) => <button key={k} type="button" aria-pressed={sort === k} className={sort === k ? 'is-on' : ''} onClick={() => setSort(k)}>{t(label)}</button>)}
          </div>
          <label className="pl__chk"><input type="checkbox" checked={onlyAvail} onChange={e => setOnlyAvail(e.target.checked)} /><span>{t('Available only')}</span></label>
          <button type="button" className={`pl__adv${adv ? ' is-on' : ''}`} aria-expanded={adv} onClick={() => setAdv(a => !a)}><SlidersHorizontal size={15} />{t('Ranking weights')}<ChevronDown size={14} /></button>
        </div>
      </header>

      {adv && (
        <div className="pl__weights sk-reveal">
          {(['distance', 'rating', 'capacity'] as const).map(k => (
            <label key={k}><span>{t(k === 'distance' ? 'Distance' : k === 'rating' ? 'Rating' : 'Quota')} <b>{weights[k]}</b></span>
              <RangeInput min={0} max={100} value={weights[k]} label={t(k)} onChange={v => setWeights({ ...weights, [k]: v })} />
            </label>
          ))}
        </div>
      )}

      {!loading && !anyAvailable && <p className="pl__none" role="status">{t('No partner is available for this order. Adjust the weight or pickup point.')}</p>}

      <div className="pl__list" aria-busy={loading}>
        {loading ? [0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} stats lines={2} label={t('Finding partners…')} />) : rows.map((e, idx) => {
          const p = e.partner, isSel = selectedId === p.id, av = AVAIL[e.availability]
          const q = quotes[p.id]; const priced = q?.status === 'ok'
          const blocked = e.availability !== 'available' || locked || !priced
          const isRec = recommendedId === p.id && e.availability === 'available' && priced && !locked
          const fit = materialFit(orderTypes, p.accepts)
          const quotaPct = Math.max(0, Math.min(100, (e.remainingKg / p.quotaKg) * 100))
          const extra = p.accepts.filter(x => !orderTypes.includes(x)).length
          const why = locked && !isSel ? t('Partner selection is locked while a partner is selected. Cancel it to edit this order.')
            : e.issues[0] ? reason(e.issues[0])
            : !priced ? t('Pricing needs configuration')
            : ''
          return (
            <motion.article key={p.id} layout="position" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: Math.min(idx, 8) * .04 }}
              className={`pl__card pl__card--${av.tone}${isSel ? ' is-sel' : ''}${isRec ? ' is-rec' : ''}`}>
              {isRec && <span className="pl__rec" title={t('Recommended for price, distance and material fit')}><Sparkles size={12} />{t('Recommended')}</span>}
              <div className="pl__top">
                <span className="pl__logo" role="img" aria-label={t('Logo placeholder')} style={{ background: `hsl(${p.hue} 60% 92%)`, color: `hsl(${p.hue} 55% 28%)` }}>{p.logo}</span>
                <div className="pl__name">
                  <h3>{p.name}</h3>
                  <span className="pl__sub">{p.reviews > 0 ? <><Star size={12} fill="currentColor" />{p.rating.toFixed(1)} <span className="pl__muted">({p.reviews})</span></> : <span className="pl__muted">{t('New partner')}</span>} · {p.city}</span>
                </div>
                <span className={`pl__status pl__status--${av.tone}`}>{t(av.label)}</span>
              </div>

              <div className="pl__metrics">
                <div><Wallet size={14} /><small>{t('Price estimate (IDR)')}</small><b>{priced ? formatIdr(q.breakdown.total) : '—'}</b></div>
                <div><MapPin size={14} /><small>{t('Distance')}</small><b>{e.distanceKm} km</b></div>
                <div><Gauge size={14} /><small>{t('Quota')}</small><b>{Math.round(e.remainingKg)} kg</b></div>
              </div>
              <div className="pl__bar" role="img" aria-label={t('Quota left: {kg} kg', { kg: Math.round(e.remainingKg) })}><i style={{ width: `${quotaPct}%` }} /></div>

              <div className="pl__accepts">
                <span className="pl__lbl">{t('Accepts')} · {t('Material fit')} {Math.round(fit * 100)}%</span>
                <div className="pl__chips">
                  {orderTypes.map(id => { const ok = p.accepts.includes(id); return <span key={id} className={`pl__chip ${ok ? 'is-yes' : 'is-no'}`}>{ok ? <Check size={11} /> : <X size={11} />}{subLabel(id)}</span> })}
                  {extra > 0 && <span className="pl__chip is-more">+{extra} {t('other types')}</span>}
                </div>
              </div>

              {q?.status === 'ok' ? (
                <details className="pl__price">
                  <summary><span>{t('Price breakdown')}</span><small>{t('Pricing region')}: {t(q.region.name)}</small><ChevronDown size={14} /></summary>
                  <dl>
                    <dt>{t('Fixed fee')}</dt><dd>{formatIdr(q.breakdown.fixed)}</dd>
                    <dt>{t('Transport by distance')}<em>{q.breakdown.distanceKm.toFixed(2)} km × Rp{q.breakdown.transportRate.toLocaleString('id-ID')}/km</em></dt><dd>{formatIdr(q.breakdown.transport)}</dd>
                    <dt>{t('Heavy handling')}<em>{q.breakdown.weightKg} kg × Rp{q.breakdown.handlingRate.toLocaleString('id-ID')}/kg</em></dt><dd>{formatIdr(q.breakdown.handling)}</dd>
                    {q.breakdown.rounding !== 0 && <><dt>{t('Rounding')}</dt><dd>{formatIdr(q.breakdown.rounding)}</dd></>}
                    <dt className="pl__tot">{t('Total')}</dt><dd className="pl__tot">{formatIdr(q.breakdown.total)}</dd>
                  </dl>
                  <small className="pl__formula">H = B + (J × T) + (W × K)</small>
                </details>
              ) : q ? (
                <div className="pl__needcfg" role="note">
                  <b>{t('Pricing needs configuration')}</b>
                  <p>{t('No verified tariff for {region} yet. Configure the regional rate to quote this partner.', { region: t(q.region.name) })}</p>
                </div>
              ) : null}

              <div className="pl__action">
                {e.availability === 'available' && e.score !== null && <span className="pl__score">{t('Match score')} <b>{e.score}</b></span>}
                {isSel ? <span className="pl__chosen">{t('Partner selected')}</span> : (
                  <button type="button" disabled={blocked} aria-describedby={blocked ? `why-${p.id}` : undefined}
                    className="pl__btn" onClick={() => onSelect(e, priced ? q.breakdown.total : undefined)}>{t('Select partner')}</button>
                )}
              </div>
              {blocked && !isSel && why && <p id={`why-${p.id}`} className="pl__why">{t('Cannot select:')} {why}</p>}
            </motion.article>
          )
        })}
        {!loading && rows.length === 0 && <p className="pl__none" role="status">{t('No partners match this filter.')}</p>}
      </div>
    </section>
  )
}
