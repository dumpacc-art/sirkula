import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Stepper from '../../components/pickup/Stepper'
import DetailStep from '../../components/pickup/DetailStep'
import PartnerStep from '../../components/pickup/PartnerStep'
import ConfirmStep from '../../components/pickup/ConfirmStep'
import { quoteForChosen } from '../../components/pickup/quote'
import SuccessAnimation from '../../components/smartmatch/SuccessAnimation'
import { findSub, type Lang } from '../../config/wasteTaxonomy'
import { EWASTE_TEAM } from '../../config/ewasteTeam'
import type { Submission } from '../../types'
import './Pickup.css'

const STEPS = [
  { key: 'detail', label: 'Detail', hint: 'Location and waste' },
  { key: 'partner', label: 'Choose partner', hint: 'SmartMatch' },
  { key: 'confirm', label: 'Confirm', hint: 'Price and pickup' },
]

/**
 * One path for a pickup: Detail → Choose partner → Confirm.
 * The step is derived from the saved order, so a reload always lands in the right place.
 *   ?sub=<id>  opens a specific order (e.g. a draft created by Repeat order)
 *   ?new=1     starts a fresh order even when an unconfirmed draft exists
 */
export default function PickupPage() {
  const { submissions, confirmOrder, partners } = useStore(); const { t, lang } = useT()
  const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'; const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const forceNew = params.get('new') === '1', subParam = params.get('sub')
  const drafts = submissions.filter(s => !s.orderId)
  const sub = forceNew ? undefined : (subParam ? submissions.find(s => s.id === subParam) : drafts[0])
  const step = !sub ? 1 : sub.orderId ? 4 : sub.partner ? 3 : 2
  const [done, setDone] = useState<{ orderId: string; partner: string; categories: string[] } | null>(null)

  const confirm = (s: Submission) => {
    if (!s.partner) return
    const q = quoteForChosen(s, partners)
    const id = confirmOrder(s.id, q?.status === 'ok' ? q.breakdown : null)
    if (id) setDone({ orderId: id, partner: s.partner.team ? t(EWASTE_TEAM.name) : s.partner.name,
      categories: s.wasteTypes.map(x => findSub(x)?.sub.label[L]).filter((x): x is string => !!x) })
  }
  const open = (id: string) => setParams({ sub: id }, { replace: true })

  return (
    <div className="pkp">
      <header className="pkp__head">
        <span className="pkp__eyebrow">{t('Pickup')}</span>
        <h1>{step === 1 ? t('Schedule a pickup') : step === 2 ? t('Choose a partner') : step === 3 ? t('Confirm your pickup') : t('Pickup confirmed')}</h1>
        <p>{step === 1 ? t('Tell us where your waste is and what it is. Takes about two minutes.')
          : step === 2 ? t('Matching uses your saved order. Hard rules exclude partners first; distance, rating and quota only rank the rest. Partners are fictional demo data.')
          : step === 3 ? t('Check the partner and the price, then confirm. You can still change the partner.')
          : t('Your order is now in Orders, where you can follow it on the map.')}</p>
      </header>

      <Stepper steps={STEPS} current={step} />

      {step === 1 && <>
        {forceNew && drafts.length > 0 && (
          <button type="button" className="pkp__resume" onClick={() => open(drafts[0].id)}>{t('You have an unconfirmed order ({id}). Resume it', { id: drafts[0].id })}</button>
        )}
        <DetailStep onSubmitted={id => open(id)} />
      </>}
      {step === 2 && sub && <PartnerStep sub={sub} drafts={drafts} onPickDraft={open} onNew={() => setParams({ new: '1' }, { replace: true })} onConfirm={confirm} />}
      {step >= 3 && sub && <ConfirmStep sub={sub} onConfirm={confirm} onOpenOrders={() => nav(`/app/orders?order=${sub.orderId}`)} />}

      {done && <SuccessAnimation orderId={done.orderId} partnerName={done.partner} categories={done.categories}
        onDone={() => nav(`/app/orders?order=${done.orderId}`, { replace: true })} />}
    </div>
  )
}
