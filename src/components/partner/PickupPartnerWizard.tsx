import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, LocateFixed, ScrollText, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import SuccessCard from '../ui/SuccessCard'
import { useT } from '../../i18n'
import Select from '../ui/Select'
import RangeInput from '../ui/RangeInput'
import MapPicker, { type MapFocus } from '../map/MapPicker'
import { WASTE_CATEGORIES, type Lang } from '../../config/wasteTaxonomy'
import { BUSINESS_TYPES, CONTRACT_CLAUSES, ORGANIC_SHARE_PCT } from '../../config/partnerContract'
import type { PartnerBusinessType, PickupPartner } from '../../types'
import './PickupPartnerWizard.css'

type Errs = Partial<Record<'companyName' | 'legalId' | 'contactName' | 'phone' | 'accepts' | 'quotaKg' | 'city' | 'address' | 'pin' | 'signedBy' | 'signedRole' | 'agree', string>>
/** Waste types a partner can accept. E-waste is always handled by the SIRKULA team, so it is not offered here. */
const CATS = WASTE_CATEGORIES.filter(c => c.id !== 'ewaste')

/**
 * Pickup partner registration inside Find Partners › Apply to SIRKULA (no page of its own).
 * 1 Company profile → 2 Accepted waste, capacity and location → 3 Read and sign the agreement (15% of organic waste to the SIRKULA office).
 * With an existing partner it only edits steps 1 and 2; the signed agreement stays as it was.
 */
export default function PickupPartnerWizard({ existing: existingProp, onClose, onDone }: { existing?: PickupPartner; onClose: () => void; onDone: (id: string) => void }) {
  // Dikunci saat wizard dibuka. Setelah "Sign and register" store langsung punya profil mitra, sehingga prop `existing` dari induk berubah dari kosong menjadi terisi
  // di tengah alur: jumlah langkah turun dari 3 ke 2, steps[2] jadi undefined, t(undefined) melempar error, dan seluruh halaman macet/putih. Itu penyebab "freeze" sebelumnya.
  const [existing] = useState(existingProp)
  const { user, savePickupPartner, notify } = useStore(); const { t, lang } = useT(); const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const [step, setStep] = useState(0), [errs, setErrs] = useState<Errs>({})
  const [type, setType] = useState<PartnerBusinessType>(existing?.businessType ?? 'collector')
  const [companyName, setCompany] = useState(existing?.companyName ?? user?.org ?? ''), [legalId, setLegal] = useState(existing?.legalId ?? '')
  const [contactName, setContact] = useState(existing?.contactName ?? user?.name ?? ''), [phone, setPhone] = useState(existing?.phone ?? ''), [about, setAbout] = useState(existing?.about ?? '')
  const [accepts, setAccepts] = useState<string[]>(existing?.accepts ?? []), [quota, setQuota] = useState(String(existing?.quotaKg ?? '')), [radius, setRadius] = useState(existing?.radiusKm ?? 30)
  const [city, setCity] = useState(existing?.city ?? ''), [address, setAddress] = useState(existing?.address ?? ''), [pin, setPin] = useState(existing?.base ?? null as { lat: number; lng: number } | null)
  const [focus, setFocus] = useState<MapFocus | null>(null), [geoMsg, setGeoMsg] = useState('')
  const [active, setActive] = useState(existing?.active ?? true)
  const [read, setRead] = useState(false), [agree, setAgree] = useState(false), [signedBy, setSignedBy] = useState(user?.name ?? ''), [signedRole, setSignedRole] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const steps = existing ? ['Company profile', 'Waste, capacity and location'] : ['Company profile', 'Waste, capacity and location', 'Agreement']
  const last = step === steps.length - 1
  const organicPicked = accepts.some(x => x.startsWith('org-'))

  // Read-to-the-end: the agreement checkbox unlocks once the text was scrolled to the bottom (or when it all fits without scrolling).
  const check = () => { const e = box.current; if (e && e.scrollTop + e.clientHeight >= e.scrollHeight - 8) setRead(true) }
  useEffect(() => { if (step === 2) requestAnimationFrame(check) }, [step])

  const toggle = (id: string) => setAccepts(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id])
  const locate = () => {
    if (!navigator.geolocation) return setGeoMsg('Geolocation is not supported by this browser.')
    setGeoMsg('Locating…')
    navigator.geolocation.getCurrentPosition(p => { const c = { lat: p.coords.latitude, lng: p.coords.longitude }; setPin(c); setFocus({ ...c, n: Date.now() }); setGeoMsg('') }, () => setGeoMsg('Location permission was denied. Tap the map to place the pin.'), { timeout: 8000, enableHighAccuracy: true })
  }

  const validate = (s: number): Errs => {
    const e: Errs = {}
    if (s === 0) {
      if (companyName.trim().length < 3) e.companyName = 'Enter the company or business name'
      if (legalId.replace(/\D/g, '').length < 8) e.legalId = 'Enter a valid business ID (NIB or NPWP, at least 8 digits)'
      if (!contactName.trim()) e.contactName = 'Enter a contact person'
      if (phone.replace(/\D/g, '').length < 8) e.phone = 'Enter a valid phone number'
    }
    if (s === 1) {
      if (accepts.length === 0) e.accepts = 'Choose at least one waste type'
      if (!(Number(quota) >= 50)) e.quotaKg = 'Monthly capacity must be at least 50 kg'
      if (!city.trim()) e.city = 'Enter the city'
      if (address.trim().length < 6) e.address = 'Enter the facility address'
      if (!pin) e.pin = 'Place the pin on the map'
    }
    if (s === 2) {
      if (!signedBy.trim()) e.signedBy = 'Enter the name of the person signing'
      if (!signedRole.trim()) e.signedRole = 'Enter the signer\'s role'
      if (!agree) e.agree = 'You need to accept the agreement to register'
    }
    return e
  }
  const next = () => { const e = validate(step); setErrs(e); if (Object.keys(e).length) return; if (!last) return setStep(step + 1); submit() }
  const [welcome, setWelcome] = useState<{ id: string; name: string } | null>(null)
  const submit = () => {
    const id = savePickupPartner({ businessType: type, companyName: companyName.trim(), legalId: legalId.trim(), contactName: contactName.trim(), phone: phone.trim(), about: about.trim(),
      accepts, quotaKg: Number(quota), radiusKm: radius, city: city.trim(), address: address.trim(), base: pin!, active, signedBy: signedBy.trim(), signedRole: signedRole.trim() })
    notify(existing ? 'Partner profile saved' : 'Registered as a pickup partner (prototype)')
    if (existing) onDone(id); else setWelcome({ id, name: companyName.trim() })
  }
  const E = ({ k }: { k: keyof Errs }) => errs[k] ? <em className="pw__err" role="alert">{t(errs[k]!)}</em> : null

  return (
    <section className="pw" aria-label={t('Become a pickup partner')}>
      <header className="pw__head">
        <div><h2>{existing ? t('Edit pickup partner details') : t('Become a pickup partner')}</h2><p>{t('Step {n} of {m}', { n: step + 1, m: steps.length })} · {t(steps[step])}</p></div>
        <button type="button" className="pw__ghost" onClick={onClose}>{t('Cancel')}</button>
      </header>
      <ol className="pw__steps" aria-hidden="true">{steps.map((s, i) => <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}><i>{i + 1}</i><span>{t(s)}</span></li>)}</ol>

      {step === 0 && (
        <div className="pw__body">
          <label>{t('Business type')}<Select value={type} onChange={v => setType(v as PartnerBusinessType)} options={BUSINESS_TYPES.map(b => ({ value: b.value, label: t(b.label) }))} /></label>
          <label>{t('Company or business name')}<input value={companyName} aria-invalid={!!errs.companyName} onChange={e => setCompany(e.target.value)} placeholder={t('e.g. CV Bali Daur Mandiri')} /><E k="companyName" /></label>
          <label>{t('Business ID (NIB or NPWP)')}<input value={legalId} inputMode="numeric" aria-invalid={!!errs.legalId} onChange={e => setLegal(e.target.value)} /><E k="legalId" /></label>
          <div className="pw__row">
            <label>{t('Contact person')}<input value={contactName} aria-invalid={!!errs.contactName} onChange={e => setContact(e.target.value)} /><E k="contactName" /></label>
            <label>{t('Phone')}<input value={phone} type="tel" inputMode="tel" aria-invalid={!!errs.phone} onChange={e => setPhone(e.target.value)} placeholder="08xx xxxx xxxx" /><E k="phone" /></label>
          </div>
          <label>{t('About your business (optional)')}<textarea rows={3} value={about} onChange={e => setAbout(e.target.value)} placeholder={t('What you do, how long you have been running, equipment you have')} /></label>
        </div>
      )}

      {step === 1 && (
        <div className="pw__body">
          <fieldset className="pw__fs"><legend>{t('Waste types you accept')}</legend>
            <p className="pw__hint">{t('E-waste is handled by the SIRKULA team, so it is not listed here.')}</p>
            {CATS.map(c => (
              <div key={c.id} className="pw__cat"><b>{c.label[L]}</b>
                <div className="pw__chips">{c.subs.map(s => (
                  <label key={s.id} className={`pw__chip${accepts.includes(s.id) ? ' on' : ''}`}><input type="checkbox" checked={accepts.includes(s.id)} onChange={() => toggle(s.id)} />{s.label[L]}</label>
                ))}</div>
              </div>
            ))}
            <E k="accepts" />
          </fieldset>
          <div className="pw__row">
            <label>{t('Monthly capacity (kg)')}<input type="number" min={0} inputMode="decimal" value={quota} aria-invalid={!!errs.quotaKg} onChange={e => setQuota(e.target.value)} /><E k="quotaKg" /></label>
            <label className="pw__rng">{t('Service radius')}: <b>{radius} km</b><RangeInput min={5} max={100} step={5} value={radius} onChange={setRadius} label={t('Service radius')} /></label>
          </div>
          <div className="pw__row">
            <label>{t('City')}<input value={city} aria-invalid={!!errs.city} onChange={e => setCity(e.target.value)} placeholder={t('e.g. Denpasar')} /><E k="city" /></label>
            <label>{t('Facility address')}<input value={address} aria-invalid={!!errs.address} onChange={e => setAddress(e.target.value)} placeholder={t('Street, number, district')} /><E k="address" /></label>
          </div>
          <div className="pw__map">
            <div className="pw__mapBar"><span>{t('Pin your facility. Tap the map or drag the pin.')}</span>
              <button type="button" className="pw__ghost" onClick={locate}><LocateFixed size={15} aria-hidden="true" />{t('Use my location')}</button></div>
            <MapPicker value={pin} focus={focus} onChange={setPin} height={260} />
            {geoMsg && <small className="pw__hint">{t(geoMsg)}</small>}
            {pin && <small className="pw__hint">{pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}</small>}
            <E k="pin" />
          </div>
          {existing && <label className="pw__check"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />{t('Accepting new pickup orders')}</label>}
          {organicPicked && <p className="pw__note"><ShieldCheck size={16} aria-hidden="true" />{t('You accept organic waste. The agreement requires {pct}% of the organic weight you receive to go to the SIRKULA office.', { pct: ORGANIC_SHARE_PCT })}</p>}
        </div>
      )}

      {step === 2 && !existing && (
        <div className="pw__body">
          <div className="pw__key"><ScrollText size={20} aria-hidden="true" /><div><b>{t('Organic waste share: {pct}%', { pct: ORGANIC_SHARE_PCT })}</b>
            <p>{t('You hand over {pct}% of the total weight of organic waste you receive through SIRKULA to the SIRKULA office.', { pct: ORGANIC_SHARE_PCT })}</p></div></div>
          <div className="pw__terms" ref={box} onScroll={check} tabIndex={0} role="region" aria-label={t('Pickup partner agreement')}>
            <h3>{t('Pickup partner agreement')}</h3>
            {CONTRACT_CLAUSES.map(c => <section key={c.title}><h4>{t(c.title)}</h4><p>{t(c.body, { pct: ORGANIC_SHARE_PCT })}</p></section>)}
          </div>
          {!read && <p className="pw__hint">{t('Scroll to the end of the agreement to continue.')}</p>}
          <label className={`pw__check${read ? '' : ' off'}`}><input type="checkbox" disabled={!read} checked={agree} onChange={e => setAgree(e.target.checked)} />
            {t('I have read the agreement and accept it, including the {pct}% organic waste share to the SIRKULA office.', { pct: ORGANIC_SHARE_PCT })}</label>
          <E k="agree" />
          <div className="pw__row">
            <label>{t('Name of the person signing')}<input value={signedBy} aria-invalid={!!errs.signedBy} onChange={e => setSignedBy(e.target.value)} /><E k="signedBy" /></label>
            <label>{t('Role in the company')}<input value={signedRole} aria-invalid={!!errs.signedRole} onChange={e => setSignedRole(e.target.value)} placeholder={t('e.g. Director')} /><E k="signedRole" /></label>
          </div>
        </div>
      )}

      <footer className="pw__foot">
        {step > 0 ? <button type="button" className="pw__ghost" onClick={() => { setErrs({}); setStep(step - 1) }}><ArrowLeft size={15} aria-hidden="true" />{t('Back')}</button> : <span />}
        <button type="button" className="pw__btn" onClick={next}>{last ? (existing ? t('Save changes') : t('Sign and register')) : t('Continue')}{!last && <ArrowRight size={15} aria-hidden="true" />}</button>
      </footer>
      {welcome && <SuccessCard title="Welcome, partner!" message="You are registered as a pickup partner. Users near you can now book you from Pickup › Choose partner." actionLabel="Continue"
        facts={[['Company', welcome.name], ['Partner ID', welcome.id], ['Organic waste share', `${ORGANIC_SHARE_PCT}%`]]} onDone={() => { const w = welcome; setWelcome(null); onDone(w.id) }} />}
    </section>
  )
}
