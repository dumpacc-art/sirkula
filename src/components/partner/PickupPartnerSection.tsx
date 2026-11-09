import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, UserRoundCheck, MapPin, Scale, Radius, FileSignature, Pencil, Pause, Play, ArrowRight, Trash2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { findSub, type Lang } from '../../config/wasteTaxonomy'
import { BUSINESS_TYPES, ORGANIC_SHARE_PCT } from '../../config/partnerContract'
import Modal from '../ui/Modal'
import PickupPartnerWizard from './PickupPartnerWizard'
import './PickupPartnerSection.css'

/** Top of Find Partners › Apply to SIRKULA: invitation to register as a pickup partner, or the partner's own summary once registered. */
export default function PickupPartnerSection() {
  const { user, pickupPartners, agreements, savePickupPartner, deletePickupPartner, notify } = useStore(); const { t, lang } = useT(); const nav = useNavigate()
  const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const [open, setOpen] = useState(false), [askDel, setAskDel] = useState(false)
  const mine = pickupPartners.find(p => p.ownerEmail === (user?.email ?? 'guest'))
  const agr = mine && agreements.find(a => a.title === 'Pickup partner agreement' && a.required.includes(mine.companyName))

  if (open) return <PickupPartnerWizard existing={mine} onClose={() => setOpen(false)} onDone={() => setOpen(false)} />

  if (!mine) return (
    <section className="pps pps--invite" aria-label={t('Become a pickup partner')}>
      <span className="pps__icon"><Truck size={26} aria-hidden="true" /></span>
      <div className="pps__txt">
        <h2>{t('Become a pickup partner')}</h2>
        <p>{t('Collect and process waste for SIRKULA users near you. Users book you through Pickup › Choose partner, when your waste types and service area fit their order.')}</p>
        <ol>
          <li>{t('Company profile')}</li><li>{t('Waste you accept, capacity and location')}</li><li>{t('Read and sign the agreement')}</li>
        </ol>
        <p className="pps__share">{t('Agreement highlight: {pct}% of the organic waste you receive goes to the SIRKULA office.', { pct: ORGANIC_SHARE_PCT })}</p>
      </div>
      <button type="button" className="pps__btn" onClick={() => setOpen(true)}>{t('Register as partner')}<ArrowRight size={16} aria-hidden="true" /></button>
    </section>
  )

  const toggle = () => {
    const { id: _id, ownerEmail: _o, registeredAt: _r, contract: _c, ...rest } = mine
    savePickupPartner({ ...rest, active: !mine.active }); notify(mine.active ? 'Pickup orders paused' : 'Pickup orders resumed')
  }
  const labels = mine.accepts.map(id => findSub(id)?.sub.label[L] ?? id)
  const type = BUSINESS_TYPES.find(b => b.value === mine.businessType)
  return (
    <section className="pps" aria-label={t('My pickup partner profile')}>
      <header className="pps__head">
        <span className="pps__icon"><UserRoundCheck size={24} aria-hidden="true" /></span>
        <div><small>{t('My pickup partner profile')}</small><h2>{mine.companyName}</h2><p>{type ? t(type.label) : ''} · {mine.id}</p></div>
        <span className={`pps__state${mine.active ? ' on' : ''}`}>{mine.active ? t('Accepting orders') : t('Paused')}</span>
      </header>
      <ul className="pps__facts">
        <li><MapPin size={15} aria-hidden="true" />{mine.city} · {mine.address}</li>
        <li><Scale size={15} aria-hidden="true" />{t('Capacity')}: {mine.quotaKg.toLocaleString('id-ID')} kg / {t('month')}</li>
        <li><Radius size={15} aria-hidden="true" />{t('Service radius')}: {mine.radiusKm} km</li>
        <li><FileSignature size={15} aria-hidden="true" />{t('Agreement signed by {name} on {date}', { name: mine.contract.signedBy, date: mine.contract.signedAt })}</li>
      </ul>
      <div className="pps__chips" aria-label={t('Waste types you accept')}>{labels.map(l => <span key={l}>{l}</span>)}</div>
      <p className="pps__share">{t('Organic waste share to the SIRKULA office: {pct}% of the weight you receive.', { pct: mine.contract.organicSharePct })}</p>
      <footer className="pps__act">
        <button type="button" className="pps__btn" onClick={() => setOpen(true)}><Pencil size={15} aria-hidden="true" />{t('Edit details')}</button>
        <button type="button" className="pps__ghost" onClick={toggle}>{mine.active ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{mine.active ? t('Pause orders') : t('Resume orders')}</button>
        <button type="button" className="pps__danger" onClick={() => setAskDel(true)}><Trash2 size={15} aria-hidden="true" />{t('Delete partner')}</button>
        {agr && <button type="button" className="pps__ghost" onClick={() => nav(`/app/partners?tab=agreements&id=${agr.id}`)}><FileSignature size={15} aria-hidden="true" />{t('View agreement')}</button>}
      </footer>
      <Modal open={askDel} title={t('Delete pickup partner?')} onClose={() => setAskDel(false)}>
        <div className="pps__confirm">
          <span className="pps__demo">{t('DEMO · only removes data stored in this browser')}</span>
          <p>{t('{name} will no longer appear in Pickup › Choose partner, and its pickup partner agreement is removed. Orders that were already confirmed stay in Orders and History.', { name: mine.companyName })}</p>
          <p className="pps__hint">{t('You can register again at any time to test the flow once more.')}</p>
          <div className="pps__act">
            <button type="button" className="pps__ghost" onClick={() => setAskDel(false)}>{t('Cancel')}</button>
            <button type="button" className="pps__dangerSolid" onClick={() => { setAskDel(false); deletePickupPartner() }}><Trash2 size={15} aria-hidden="true" />{t('Yes, delete partner')}</button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
