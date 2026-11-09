import { useState } from 'react'
import { Pencil, ChevronDown, Plus } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../ui/Select'
import { SkeletonCard } from '../ui/Skeleton'
import SubmissionSummary from '../smartmatch/SubmissionSummary'
import PartnerList from '../smartmatch/PartnerList'
import EwasteTeamCard from '../smartmatch/EwasteTeamCard'
import TypeCoverage from '../smartmatch/TypeCoverage'
import OrderTiles from './OrderTiles'
import PartnerFoundOverlay from './PartnerFoundOverlay'
import { useSkeleton } from '../../lib/useSkeleton'
import { evaluatePartners, type RuleWeights } from '../../features/smart-match/rules'
import { EWASTE_TEAM } from '../../config/ewasteTeam'
import { WORKFLOW_LABEL, STREAM_LABEL } from '../../config/segregation'
import { quoteCollection } from '../../features/pricing/collectionPrice'
import { materialFit, pickRecommended } from '../../features/smart-match/recommend'
import type { Submission } from '../../types'
import './PartnerStep.css'

/**
 * Pickup › step 2 (Choose partner). This is SmartMatch, now a step instead of its own menu.
 * Hard rules exclude partners first; distance, rating and quota only rank the rest. E-waste goes to the SIRKULA team instead.
 * Choosing a partner saves it on the order, and the flow moves on to Confirm.
 */
export default function PartnerStep({ sub, drafts, onPickDraft, onNew, onConfirm }: {
  sub: Submission; drafts: Submission[]; onPickDraft: (id: string) => void; onNew: () => void; onConfirm: (s: Submission) => void
}) {
  const { partnerLoad, matches, selectPartner, cancelPartner, updateSubmission, partners } = useStore(); const { t } = useT()
  const [weights, setWeights] = useState<RuleWeights>({ distance: 40, rating: 30, capacity: 30 })
  const [editOpen, setEditOpen] = useState(false), [found, setFound] = useState<{ name: string; km: number } | null>(null)
  // Placeholders hold the space while the order is (re)matched, so partner cards fade in instead of popping up.
  const computing = useSkeleton([sub.id, sub.wasteTypes.join('|'), sub.quantity.kg, sub.pickup.lat, sub.pickup.lng], 250)
  // Central pricing: one quote per partner, from the order's pickup point to the partner's facility.
  const quotes = Object.fromEntries(partners.map(p => [p.id, quoteCollection({ pickup: sub.pickup, facility: p.base, kg: sub.quantity.kg })]))
  const evals = sub.stream !== 'ewaste'
    ? evaluatePartners({ wasteTypes: sub.wasteTypes, kg: sub.quantity.kg, lat: sub.pickup.lat, lng: sub.pickup.lng }, partners, partnerLoad, weights)
    : []
  // Recommendation only among partners that are available AND quoted.
  const recommendedId = pickRecommended(evals.flatMap(e => {
    const q = quotes[e.partner.id]
    return e.availability === 'available' && q.status === 'ok'
      ? [{ id: e.partner.id, priceIdr: q.breakdown.total, distanceKm: e.distanceKm, fit: materialFit(sub.wasteTypes, e.partner.accepts) }]
      : []
  }))

  return (
    <div className="pw__stack">
      {drafts.length > 1 && (
        <label className="pw__pick">{t('Order')}
          <Select value={sub.id} onChange={onPickDraft} options={drafts.map(s => ({ value: s.id, label: `${s.id} · ${s.quantity.kg} kg · ${t(WORKFLOW_LABEL[s.workflow])}` }))} />
        </label>
      )}

      <section className="pw__card pw__order" aria-label={t('Order summary')}>
        <div className="pw__orderHead">
          <div><h2>{t('Order summary')} · {sub.id}</h2><p>{t(STREAM_LABEL[sub.stream])}</p></div>
          <div className="pw__orderActions">
            <button type="button" className="pw__chip" aria-expanded={editOpen} onClick={() => setEditOpen(o => !o)}>
              <Pencil size={14} />{t('Edit order')}<ChevronDown size={14} />
            </button>
            <button type="button" className="pw__chip" onClick={onNew}><Plus size={14} />{t('New pickup')}</button>
          </div>
        </div>
        <OrderTiles sub={sub} />
        {editOpen && <div className="pw__editBody sk-reveal"><SubmissionSummary sub={sub} readOnly={false} onChange={patch => updateSubmission(sub.id, patch)} /></div>}
      </section>

      {sub.stream === 'ewaste' ? (
        computing ? <SkeletonCard stats lines={3} label={t('Finding partners…')} /> : (
          <div className="sk-reveal"><EwasteTeamCard sub={sub}
            onRoute={() => { selectPartner(sub.id, { id: EWASTE_TEAM.id, name: EWASTE_TEAM.name, score: 0, distanceKm: 0, remainingKg: Infinity, team: true }); setFound({ name: EWASTE_TEAM.name, km: 0 }) }}
            onCancel={() => cancelPartner(sub.id)} onConfirm={() => onConfirm(sub)} /></div>
        )
      ) : (
        <>
          <TypeCoverage types={sub.wasteTypes} evals={evals} loading={computing} />
          <PartnerList
            evals={evals} quotes={quotes} recommendedId={recommendedId} loading={computing}
            weights={weights} setWeights={setWeights} locked={!!sub.partner} selectedId={sub.partner?.id} kg={sub.quantity.kg}
            orderTypes={sub.wasteTypes}
            onSelect={(e, priceIdr) => { selectPartner(sub.id, { id: e.partner.id, name: e.partner.name, score: e.score ?? 0, distanceKm: e.distanceKm, remainingKg: e.remainingKg, priceIdr }); setFound({ name: e.partner.name, km: e.distanceKm }) }}
          />
        </>
      )}

      <details className="pw__log">
        <summary>{t('Match history')}<i>{matches.length}</i></summary>
        {matches.length === 0 ? <p className="pw__muted">{t('No decisions yet.')}</p> : (
          <ul className="pw__timeline">{matches.map(m => (
            <li key={m.id} className={m.status === 'accepted' ? 'is-ok' : 'is-no'}>
              <span className="pw__hdate">{m.date}</span><span>{m.batchId} → {m.processorName}</span>
              <b>{t(m.status)}{m.status === 'accepted' && ` · ${t('score')} ${m.score}`}</b>
            </li>
          ))}</ul>
        )}
      </details>
      <PartnerFoundOverlay found={found} onClose={() => setFound(null)} />
    </div>
  )
}
